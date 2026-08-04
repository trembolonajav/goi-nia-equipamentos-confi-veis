import betoneira from "@/assets/eq-betoneira.jpg";
import martelete from "@/assets/eq-martelete.jpg";
import compactador from "@/assets/eq-compactador.jpg";
import andaime from "@/assets/eq-andaime.jpg";
import gerador from "@/assets/eq-gerador.jpg";
import vibrador from "@/assets/eq-vibrador.jpg";
import cortadora from "@/assets/eq-cortadora.jpg";
import lavadora from "@/assets/eq-lavadora.jpg";

export type Categoria =
  | "Concreto e argamassa"
  | "Demolição e perfuração"
  | "Compactação"
  | "Andaimes e altura"
  | "Corte"
  | "Energia"
  | "Limpeza";

export const CATEGORIAS: Categoria[] = [
  "Concreto e argamassa",
  "Demolição e perfuração",
  "Compactação",
  "Andaimes e altura",
  "Corte",
  "Energia",
  "Limpeza",
];

/** Busca por serviço — o cliente sabe o que precisa fazer, não o nome técnico. */
export const SERVICOS = [
  "Misturar concreto",
  "Quebrar concreto",
  "Perfurar parede",
  "Compactar solo",
  "Trabalhar em altura",
  "Cortar piso ou concreto",
  "Adensar concreto",
  "Energia na obra",
  "Limpeza pesada",
  "Escorar laje",
];

export type Equipamento = {
  slug: string;
  nome: string;
  categoria: Categoria;
  img: string;
  aplicacao: string;
  servicos: string[];
  destaque?: boolean;
  specs: { label: string; valor: string }[];
  tags: string[];
  energia: "Elétrico" | "Combustão" | "Manual";
  descricao: string;
  naoIndicado: string;
  requisitos: string[];
  cuidados: string[];
  acessorios: string[];
  relacionados: string[];
};

export const EQUIPAMENTOS: Equipamento[] = [
  {
    slug: "betoneira-400-litros",
    nome: "Betoneira 400 litros",
    categoria: "Concreto e argamassa",
    img: betoneira,
    aplicacao: "Para concreto e argamassa em volume médio direto na obra.",
    servicos: ["Misturar concreto"],
    destaque: true,
    energia: "Elétrico",
    specs: [
      { label: "Capacidade", valor: "400 L" },
      { label: "Motor", valor: "2 CV elétrico" },
      { label: "Voltagem", valor: "220V mono ou trifásica" },
    ],
    tags: ["400L", "Monofásica e trifásica"],
    descricao:
      "Betoneira de 400 litros para produção contínua de concreto e argamassa em obras residenciais e comerciais. Sai revisada, com correias e cuba conferidas.",
    naoIndicado: "Não indicada para concreto usinado, misturas químicas agressivas ou uso sem aterramento elétrico.",
    requisitos: [
      "Ponto de energia 220V com disjuntor dedicado",
      "Piso nivelado e firme para operação",
      "Uso de EPI: luvas, óculos e botina",
    ],
    cuidados: [
      "Limpe a cuba ao fim de cada dia de uso",
      "Não bata na cuba com ferramenta metálica",
      "Nunca opere sem a proteção da coroa",
    ],
    acessorios: ["Manual de operação", "Chave de regulagem"],
    relacionados: ["vibrador-de-concreto", "gerador-5-kva", "carrinho-martelete-rompedor"],
  },
  {
    slug: "betoneira-145-litros",
    nome: "Betoneira 145 litros",
    categoria: "Concreto e argamassa",
    img: betoneira,
    aplicacao: "Reformas e pequenas obras: argamassa, contrapiso e assentamento.",
    servicos: ["Misturar concreto"],
    energia: "Elétrico",
    specs: [
      { label: "Capacidade", valor: "145 L" },
      { label: "Motor", valor: "1 CV elétrico" },
      { label: "Voltagem", valor: "127V / 220V" },
    ],
    tags: ["145L", "Compacta"],
    descricao:
      "Modelo compacto, fácil de transportar e ideal para reformas em áreas com pouco espaço. Passa em vãos estreitos e liga em tomada comum 220V.",
    naoIndicado: "Não indicada para grandes volumes de concreto estrutural.",
    requisitos: ["Tomada 127V ou 220V conforme o modelo", "Local plano e seco"],
    cuidados: ["Lave a cuba após o uso", "Evite sobrecarregar acima da capacidade útil"],
    acessorios: ["Manual de operação"],
    relacionados: ["betoneira-400-litros", "vibrador-de-concreto"],
  },
  {
    slug: "martelete-rompedor",
    nome: "Martelete rompedor",
    categoria: "Demolição e perfuração",
    img: martelete,
    aplicacao: "Quebra de concreto, alvenaria, piso e abertura de rasgos.",
    servicos: ["Quebrar concreto", "Perfurar parede"],
    destaque: true,
    energia: "Elétrico",
    specs: [
      { label: "Peso", valor: "5 kg a 30 kg" },
      { label: "Encaixe", valor: "SDS-Plus / SDS-Max / Hex" },
      { label: "Voltagem", valor: "127V / 220V" },
    ],
    tags: ["5kg a 30kg", "Acessórios inclusos"],
    descricao:
      "Linha de marteletes e rompedores para perfuração e demolição. Escolhemos o peso certo conforme o serviço: leve para furos e rasgos, pesado para demolição de piso e concreto armado.",
    naoIndicado: "Não indicado para demolição estrutural sem projeto ou para corte de peças cerâmicas delicadas.",
    requisitos: [
      "Energia 127V ou 220V conforme o modelo",
      "EPI obrigatório: protetor auricular, óculos e luvas antivibração",
    ],
    cuidados: [
      "Não force o equipamento como alavanca",
      "Faça pausas para não superaquecer o motor",
      "Use apenas ponteiros e brocas compatíveis",
    ],
    acessorios: ["Ponteiro", "Talhadeira", "Brocas conforme o modelo", "Maleta"],
    relacionados: ["cortadora-de-piso", "lavadora-alta-pressao", "gerador-5-kva"],
  },
  {
    slug: "compactador-de-solo",
    nome: "Compactador de solo (sapo)",
    categoria: "Compactação",
    img: compactador,
    aplicacao: "Compactação de valas, bases estreitas e reaterro.",
    servicos: ["Compactar solo"],
    energia: "Combustão",
    specs: [
      { label: "Peso", valor: "~70 kg" },
      { label: "Motor", valor: "4 tempos a gasolina" },
      { label: "Impacto", valor: "Alta energia em solos coesivos" },
    ],
    tags: ["Gasolina", "Valas e reaterro"],
    descricao:
      "Compactador tipo sapo, indicado para solos argilosos e locais estreitos onde a placa vibratória não alcança.",
    naoIndicado: "Não indicado para areia solta ou compactação de asfalto.",
    requisitos: ["Combustível por conta do cliente", "Operação em área ventilada", "EPI: botina, luvas e protetor auricular"],
    cuidados: ["Verifique o óleo antes de ligar", "Transporte sempre na posição vertical"],
    acessorios: ["Manual de operação"],
    relacionados: ["placa-vibratoria", "gerador-5-kva"],
  },
  {
    slug: "placa-vibratoria",
    nome: "Placa vibratória",
    categoria: "Compactação",
    img: compactador,
    aplicacao: "Compactação de base para calçada, piso intertravado e aterro.",
    servicos: ["Compactar solo"],
    destaque: true,
    energia: "Combustão",
    specs: [
      { label: "Força centrífuga", valor: "A partir de 1.500 kgf" },
      { label: "Motor", valor: "Gasolina 5,5 HP" },
      { label: "Placa", valor: "Aço reforçado" },
    ],
    tags: ["Placa vibratória", "Calçada e intertravado"],
    descricao:
      "Ideal para compactar bases antes de concretagem, assentamento de intertravado e nivelamento de terreno.",
    naoIndicado: "Não indicada para valas estreitas e profundas — nesse caso use o compactador tipo sapo.",
    requisitos: ["Combustível por conta do cliente", "Terreno livre de entulho e pedras grandes"],
    cuidados: ["Não opere sobre superfície molhada em excesso", "Deixe o motor esfriar antes de transportar"],
    acessorios: ["Manual de operação"],
    relacionados: ["compactador-de-solo", "cortadora-de-piso"],
  },
  {
    slug: "andaime-tubular",
    nome: "Andaime tubular (torre)",
    categoria: "Andaimes e altura",
    img: andaime,
    aplicacao: "Trabalho em altura para pintura, reboco, forro e fachada.",
    servicos: ["Trabalhar em altura"],
    destaque: true,
    energia: "Manual",
    specs: [
      { label: "Módulo", valor: "Torre de 1 m e 1,5 m" },
      { label: "Componentes", valor: "Painéis, diagonais, rodízios e piso" },
      { label: "Montagem", valor: "Empilhável conforme a altura" },
    ],
    tags: ["Torre 1m e 1,5m", "Plataforma metálica"],
    descricao:
      "Torres de andaime tubular com plataforma, rodízios e diagonais. Locação por módulo, com orientação de montagem segura.",
    naoIndicado: "Não indicado para uso sem travamento, sem guarda-corpo ou em piso irregular.",
    requisitos: [
      "Piso firme e nivelado",
      "Guarda-corpo e rodapé em alturas superiores a 2 m",
      "Cinto de segurança conforme NR-35",
    ],
    cuidados: ["Nunca movimente a torre com pessoa em cima", "Trave os rodízios antes de subir"],
    acessorios: ["Piso metálico", "Rodízios", "Diagonais"],
    relacionados: ["escora-metalica", "lavadora-alta-pressao"],
  },
  {
    slug: "escora-metalica",
    nome: "Escora metálica regulável",
    categoria: "Andaimes e altura",
    img: andaime,
    aplicacao: "Escoramento de laje e formas durante a concretagem e a cura.",
    servicos: ["Escorar laje"],
    energia: "Manual",
    specs: [
      { label: "Regulagem", valor: "1,80 m a 3,00 m" },
      { label: "Material", valor: "Aço galvanizado" },
      { label: "Locação", valor: "Por unidade / mês" },
    ],
    tags: ["Reguláveis", "Locação por unidade"],
    descricao:
      "Escoras metálicas reguláveis para sustentação de lajes e formas. Locação por quantidade, com orientação de espaçamento.",
    naoIndicado: "Não indicada para cargas acima da especificação do fabricante ou apoio em solo sem calço.",
    requisitos: ["Base apoiada em prancha ou calço", "Conferência de prumo antes da concretagem"],
    cuidados: ["Não retire escoras antes do prazo de cura", "Não use escora empenada"],
    acessorios: ["Pino de travamento"],
    relacionados: ["andaime-tubular", "betoneira-400-litros"],
  },
  {
    slug: "cortadora-de-piso",
    nome: "Cortadora de piso e concreto",
    categoria: "Corte",
    img: cortadora,
    aplicacao: "Corte de piso, asfalto e concreto para juntas e recortes.",
    servicos: ["Cortar piso ou concreto"],
    energia: "Combustão",
    specs: [
      { label: "Disco", valor: "Diamantado 350 mm" },
      { label: "Profundidade", valor: "Até 12 cm" },
      { label: "Motor", valor: "Gasolina" },
    ],
    tags: ["Disco diamantado", "Corte até 12cm"],
    descricao:
      "Cortadora autopropelida manualmente para juntas de dilatação, recortes em piso e abertura de valas em concreto.",
    naoIndicado: "Não indicada para corte de metal ou madeira.",
    requisitos: ["Água para refrigeração do disco", "EPI: óculos, protetor auricular e máscara"],
    cuidados: ["Nunca force lateralmente o disco", "Confira a fixação do disco antes de ligar"],
    acessorios: ["Disco diamantado", "Chaves de troca"],
    relacionados: ["martelete-rompedor", "placa-vibratoria"],
  },
  {
    slug: "vibrador-de-concreto",
    nome: "Vibrador de concreto",
    categoria: "Concreto e argamassa",
    img: vibrador,
    aplicacao: "Adensamento de concreto em lajes, pilares e vigas.",
    servicos: ["Adensar concreto"],
    energia: "Elétrico",
    specs: [
      { label: "Mangote", valor: "35 mm / 45 mm" },
      { label: "Comprimento", valor: "4 a 6 m" },
      { label: "Motor", valor: "Elétrico 220V" },
    ],
    tags: ["Mangote 35/45mm", "220V"],
    descricao:
      "Conjunto motor + mangote para eliminar bolhas de ar e garantir resistência e acabamento do concreto.",
    naoIndicado: "Não indicado para argamassa seca ou uso contínuo fora d'água em mangote danificado.",
    requisitos: ["Energia 220V", "Operador com EPI básico"],
    cuidados: ["Não dobre o mangote em ângulo fechado", "Limpe o mangote logo após o uso"],
    acessorios: ["Mangote", "Extensão elétrica sob consulta"],
    relacionados: ["betoneira-400-litros", "gerador-5-kva"],
  },
  {
    slug: "gerador-5-kva",
    nome: "Gerador de energia 5 kVA",
    categoria: "Energia",
    img: gerador,
    aplicacao: "Energia para obras sem rede elétrica ou com rede insuficiente.",
    servicos: ["Energia na obra"],
    energia: "Combustão",
    specs: [
      { label: "Potência", valor: "5 kVA" },
      { label: "Combustível", valor: "Gasolina" },
      { label: "Saídas", valor: "127V e 220V" },
    ],
    tags: ["5 kVA", "127V e 220V"],
    descricao:
      "Gerador portátil para alimentar ferramentas elétricas, iluminação e pequenos equipamentos na obra.",
    naoIndicado: "Não indicado para uso em ambiente fechado sem ventilação nem para equipamentos acima da potência nominal.",
    requisitos: ["Área ventilada e coberta da chuva", "Combustível por conta do cliente", "Aterramento adequado"],
    cuidados: ["Desligue antes de reabastecer", "Não ligue cargas somadas acima de 5 kVA"],
    acessorios: ["Manual de operação"],
    relacionados: ["vibrador-de-concreto", "martelete-rompedor"],
  },
  {
    slug: "lavadora-alta-pressao",
    nome: "Lavadora de alta pressão",
    categoria: "Limpeza",
    img: lavadora,
    aplicacao: "Limpeza pesada de piso, fachada, forma e equipamentos.",
    servicos: ["Limpeza pesada"],
    energia: "Elétrico",
    specs: [
      { label: "Pressão", valor: "A partir de 1.800 psi" },
      { label: "Uso", valor: "Profissional contínuo" },
      { label: "Voltagem", valor: "220V" },
    ],
    tags: ["Alta pressão", "Uso profissional"],
    descricao:
      "Lavadora profissional para limpeza final de obra, remoção de resíduo de argamassa e higienização de superfícies.",
    naoIndicado: "Não indicada para superfícies frágeis, esquadrias delicadas ou pintura recente.",
    requisitos: ["Ponto de água e energia 220V", "Mangueira de alimentação no local"],
    cuidados: ["Nunca aponte o jato para pessoas", "Não deixe a bomba trabalhar sem água"],
    acessorios: ["Pistola", "Lança", "Bicos"],
    relacionados: ["gerador-5-kva", "cortadora-de-piso"],
  },
  {
    slug: "carrinho-martelete-rompedor",
    nome: "Rompedor pesado 30 kg",
    categoria: "Demolição e perfuração",
    img: martelete,
    aplicacao: "Demolição pesada de piso, base de concreto e calçada.",
    servicos: ["Quebrar concreto"],
    energia: "Elétrico",
    specs: [
      { label: "Peso", valor: "30 kg" },
      { label: "Encaixe", valor: "Hexagonal 30 mm" },
      { label: "Voltagem", valor: "220V" },
    ],
    tags: ["30kg", "Demolição pesada"],
    descricao:
      "Rompedor de alto impacto para demolição de pisos espessos, bases de máquina e concreto armado leve.",
    naoIndicado: "Não indicado para trabalho em altura ou para paredes de alvenaria fina.",
    requisitos: ["Energia 220V com cabo dimensionado", "Dois operadores para transporte", "EPI completo"],
    cuidados: ["Faça pausas a cada 20 minutos de operação", "Não use como alavanca"],
    acessorios: ["Ponteiro", "Talhadeira", "Carrinho de transporte"],
    relacionados: ["martelete-rompedor", "cortadora-de-piso"],
  },
];

export function getEquipamento(slug: string) {
  return EQUIPAMENTOS.find((e) => e.slug === slug);
}

export const DESTAQUES = EQUIPAMENTOS.filter((e) => e.destaque);
