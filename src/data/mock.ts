// Dados exatos do mockup "Sistema LOCAGO v2" portados para o protótipo.
// A imagem é uma chave resolvida por imgOf() em lib/images.

export interface Produto {
  id: string; nome: string; categoria: string; controle: "patrimonio" | "quantidade" | "consumo"; img: string;
  diaria: number; semanal: number; quinzenal: number; mensal: number; caucao: number; reposicao: number;
  minimo: string; preparo: string; inspecao: string; multa: string; limpeza: string;
  receita: number; custoManut: number; diasLocada: number; diasParada: number; aquisicao: number; unidades?: number;
  marca?: string; modelo?: string; prefixo?: string;
}

export const PRODUTOS: Produto[] = [
  { id: "BET400", nome: "Betoneira 400 litros", categoria: "Concreto e argamassa", controle: "patrimonio", img: "betoneira",
    diaria: 95, semanal: 420, quinzenal: 780, mensal: 1180, caucao: 300, reposicao: 9800,
    minimo: "1 diária", preparo: "2 h", inspecao: "4 h", multa: "1 diária cheia + 10%", limpeza: "R$ 60 se voltar com resíduo",
    receita: 18400, custoManut: 4200, diasLocada: 130, diasParada: 35, aquisicao: 9000 },
  { id: "MART", nome: "Martelete rompedor", categoria: "Demolição e perfuração", controle: "patrimonio", img: "martelete",
    diaria: 80, semanal: 360, quinzenal: 660, mensal: 990, caucao: 250, reposicao: 6400,
    minimo: "1 diária", preparo: "1 h", inspecao: "2 h", multa: "1 diária cheia + 10%", limpeza: "R$ 40 se voltar com resíduo",
    receita: 22100, custoManut: 3100, diasLocada: 176, diasParada: 21, aquisicao: 6200 },
  { id: "PLACA", nome: "Placa vibratória", categoria: "Compactação", controle: "patrimonio", img: "compactador",
    diaria: 140, semanal: 630, quinzenal: 1160, mensal: 1750, caucao: 500, reposicao: 14200,
    minimo: "1 diária", preparo: "2 h", inspecao: "4 h", multa: "1 diária cheia + 10%", limpeza: "R$ 80 se voltar com solo aderido",
    receita: 15900, custoManut: 5400, diasLocada: 98, diasParada: 46, aquisicao: 13500 },
  { id: "GER5", nome: "Gerador 5 kVA", categoria: "Energia", controle: "patrimonio", img: "gerador",
    diaria: 160, semanal: 720, quinzenal: 1330, mensal: 2000, caucao: 600, reposicao: 11800,
    minimo: "1 diária", preparo: "3 h", inspecao: "6 h", multa: "1 diária cheia + 10%", limpeza: "R$ 60",
    receita: 12300, custoManut: 2900, diasLocada: 71, diasParada: 28, aquisicao: 11000 },
  { id: "CORT", nome: "Cortadora de piso", categoria: "Corte", controle: "patrimonio", img: "cortadora",
    diaria: 180, semanal: 810, quinzenal: 1490, mensal: 2250, caucao: 700, reposicao: 16400,
    minimo: "1 diária", preparo: "2 h", inspecao: "4 h", multa: "1 diária cheia + 10%", limpeza: "R$ 90",
    receita: 9800, custoManut: 3800, diasLocada: 52, diasParada: 33, aquisicao: 15200 },
  { id: "LAV", nome: "Lavadora de alta pressão", categoria: "Limpeza", controle: "patrimonio", img: "lavadora",
    diaria: 110, semanal: 490, quinzenal: 900, mensal: 1370, caucao: 350, reposicao: 5200,
    minimo: "1 diária", preparo: "1 h", inspecao: "2 h", multa: "1 diária cheia + 10%", limpeza: "não se aplica",
    receita: 7400, custoManut: 900, diasLocada: 63, diasParada: 12, aquisicao: 4900 },
  { id: "ANDA", nome: "Andaime tubular (torre)", categoria: "Andaimes e altura", controle: "quantidade", img: "andaime",
    diaria: 35, semanal: 150, quinzenal: 280, mensal: 420, caucao: 150, reposicao: 1900,
    minimo: "1 diária por torre", preparo: "1 h", inspecao: "1 h", multa: "1 diária cheia", limpeza: "não se aplica",
    receita: 26800, custoManut: 1600, diasLocada: 214, diasParada: 9, aquisicao: 22000, unidades: 12 },
];

export interface Patrimonio { cod: string; prod: string; serie: string; estado: string; local: string; horimetro: string; proxima: string; }

export const PATRIMONIOS: Patrimonio[] = [
  { cod: "BET-0001", prod: "BET400", serie: "SN 44182", estado: "Disponível", local: "Galpão · setor A", horimetro: "412 h", proxima: "revisão em 88 h" },
  { cod: "BET-0002", prod: "BET400", serie: "SN 44190", estado: "Locado", local: "Obra Residencial Alfa", horimetro: "530 h", proxima: "revisão em 20 h" },
  { cod: "BET-0003", prod: "BET400", serie: "SN 44201", estado: "Em manutenção", local: "Oficina parceira", horimetro: "612 h", proxima: "troca de correia" },
  { cod: "BET-0004", prod: "BET400", serie: "SN 44233", estado: "Em inspeção", local: "Galpão · recepção", horimetro: "298 h", proxima: "aguardando liberação" },
  { cod: "MAR-0001", prod: "MART", serie: "SN 78210", estado: "Locado", local: "Obra Edifício Central", horimetro: "220 h", proxima: "revisão em 80 h" },
  { cod: "MAR-0002", prod: "MART", serie: "SN 78244", estado: "Disponível", local: "Galpão · setor B", horimetro: "141 h", proxima: "revisão em 159 h" },
  { cod: "MAR-0003", prod: "MART", serie: "SN 78261", estado: "Reservado", local: "Galpão · setor B", horimetro: "96 h", proxima: "revisão em 204 h" },
  { cod: "PLA-0001", prod: "PLACA", serie: "SN 21044", estado: "Locado", local: "Obra Jardim América", horimetro: "388 h", proxima: "revisão em 12 h" },
  { cod: "PLA-0002", prod: "PLACA", serie: "SN 21077", estado: "Disponível", local: "Galpão · pátio", horimetro: "205 h", proxima: "revisão em 95 h" },
  { cod: "GER-0001", prod: "GER5", serie: "SN 90112", estado: "Aguardando coleta", local: "Obra Senador Canedo", horimetro: "744 h", proxima: "revisão vencida" },
  { cod: "GER-0002", prod: "GER5", serie: "SN 90140", estado: "Disponível", local: "Galpão · setor A", horimetro: "310 h", proxima: "revisão em 90 h" },
  { cod: "COR-0001", prod: "CORT", serie: "SN 55021", estado: "Disponível", local: "Galpão · pátio", horimetro: "180 h", proxima: "troca de disco em 20 h" },
  { cod: "LAV-0001", prod: "LAV", serie: "SN 33810", estado: "Em inspeção", local: "Galpão · recepção", horimetro: "126 h", proxima: "aguardando liberação" },
  { cod: "LAV-0002", prod: "LAV", serie: "SN 33844", estado: "Disponível", local: "Galpão · setor B", horimetro: "88 h", proxima: "revisão em 112 h" },
];

export interface Obra { nome: string; endereco: string; restricao: string; frete: number; equipamentos: string; }
export interface Cliente {
  id: string; nome: string; doc: string; tipo: string; tel: string; email: string; situacao: string; desde: string;
  condicao: string; inscricao: string; resp: string; endereco: string; aviso: string; obs: string;
  obras: Obra[]; docs: { nome: string; ok: boolean }[];
  cep?:string; logradouro?:string; numeroEndereco?:string; complemento?:string; bairro?:string; cidade?:string; uf?:string; quadra?:string; lote?:string;
}

export const CLIENTES: Cliente[] = [
  { id: "CL-0043", nome: "Marcos Vieira", doc: "CPF 042.***.***-18", tipo: "Pessoa física", tel: "(62) 99812-4470", email: "marcos.vieira@email.com",
    situacao: "Ativo", desde: "março de 2026", condicao: "Pagamento à vista", inscricao: "RG 4.882.117 SSP-GO", resp: "O próprio",
    endereco: "Rua 26-A, 118 · Setor Aeroporto · Goiânia — GO", aviso: "",
    obs: "Prefere contato por WhatsApp. Retira no balcão pela manhã e devolve no último dia do prazo.",
    obras: [], docs: [{ nome: "RG", ok: true }, { nome: "Comprovante de endereço", ok: true }, { nome: "CNH", ok: false }] },
  { id: "CL-0011", nome: "Construtora Aroeira", doc: "CNPJ 21.***.***/0001-72", tipo: "Pessoa jurídica", tel: "(62) 3251-8890", email: "compras@aroeira.com.br",
    situacao: "Em análise", desde: "agosto de 2026", condicao: "Faturado 15 dias em análise", inscricao: "IE 10.451.882-7", resp: "Juliana Aroeira · compras",
    endereco: "Av. T-9, 2350 · Setor Bueno · Goiânia — GO", aviso: "Primeira locação faturada aguarda aprovação do gerente",
    obs: "Nota sempre em nome da construtora. Portaria exige lista de entregadores com 30 minutos de antecedência.",
    obras: [{ nome: "Residencial Alfa", endereco: "Rua T-55, 1240 · Setor Bueno", restricao: "Entrega só entre 7h e 11h", frete: 95, equipamentos: "1 betoneira, 6 torres de andaime" }],
    docs: [{ nome: "Contrato social", ok: true }, { nome: "Cartão CNPJ", ok: true }, { nome: "Ficha cadastral assinada", ok: false }] },
  { id: "CL-0027", nome: "Obras JR Engenharia", doc: "CNPJ 44.***.***/0001-19", tipo: "Pessoa jurídica", tel: "(62) 3092-4410", email: "financeiro@obrasjr.com.br",
    situacao: "Bloqueado", desde: "janeiro de 2026", condicao: "Faturado 30 dias · limite R$ 12.000", inscricao: "IE 10.772.104-3", resp: "Wesley Torres · engenharia",
    endereco: "Rua 9, 415 · Senador Canedo — GO", aviso: "Gerador em atraso há 3 dias e cobrança vencida",
    obs: "Várias frentes de obra ao mesmo tempo. Confirmar o endereço de cada contrato: nem sempre é o da sede.",
    obras: [{ nome: "Edifício Central", endereco: "Av. Anhanguera, 4120 · Centro", restricao: "Rua estreita, caminhão pequeno", frete: 60, equipamentos: "1 martelete" },
            { nome: "Galpão Senador Canedo", endereco: "Rua 9, 415 · Senador Canedo", restricao: "Acesso livre", frete: 95, equipamentos: "1 gerador 5 kVA" }],
    docs: [{ nome: "Contrato social", ok: true }, { nome: "Cartão CNPJ", ok: true }, { nome: "Procuração do responsável", ok: true }] },
  { id: "CL-0058", nome: "Elton Ribeiro", doc: "CPF 771.***.***-04", tipo: "Pessoa física", tel: "(62) 98140-2277", email: "elton.ribeiro@email.com",
    situacao: "Ativo", desde: "agosto de 2026", condicao: "Pagamento à vista", inscricao: "RG 6.104.339 SSP-GO", resp: "O próprio",
    endereco: "Rua Ipê, 74 · Vila Redenção · Goiânia — GO", aviso: "Pix da locação atual ainda não confirmado",
    obs: "Primeiro contato veio pelo site. Ainda sem histórico de devolução.",
    obras: [], docs: [{ nome: "RG", ok: true }, { nome: "Comprovante de endereço", ok: false }] },
  { id: "CL-0064", nome: "Fernanda Prado", doc: "CPF 663.***.***-71", tipo: "Pessoa física", tel: "(62) 99333-8812", email: "fernanda.prado@email.com",
    situacao: "Ativo", desde: "julho de 2026", condicao: "Pagamento à vista", inscricao: "RG 5.220.881 SSP-GO", resp: "O próprio",
    endereco: "Rua C-140, 76 · Jardim América · Goiânia — GO", aviso: "",
    obs: "Reforma própria. Pede coleta sempre depois das 15h.",
    obras: [{ nome: "Reforma Jardim América", endereco: "Rua C-140, 76 · Jardim América", restricao: "Coletar após 15h", frete: 60, equipamentos: "1 placa vibratória" }],
    docs: [{ nome: "RG", ok: true }, { nome: "Comprovante de endereço", ok: true }] },
];

export interface ItemContrato { prod: string; qtd?: number; nome: string; patrimonio: string; estado: string; valor: number; }
export interface Contrato {
  numero: string; clienteId: string; inicio: string; fim: string; situacao: string; pagamento: string; caucao: number; caucaoSit: string;
  local: string; endereco: string; frete: number; servicos: number; locacao: number;
  itens: ItemContrato[]; memoria: { linha: string; valor: string }[];
  linha: { q: string; t: string; d: string; a: string }[]; docs: { nome: string; quando: string; ok: boolean }[];
}

export const CONTRATOS: Contrato[] = [
  { numero: "CT-2026-0148", clienteId: "CL-0011", inicio: "2026-08-05", fim: "2026-09-04", situacao: "Em andamento", pagamento: "Pago", caucao: 900, caucaoSit: "Retida até a inspeção final",
    local: "Residencial Alfa", endereco: "Rua T-55, 1240 · Setor Bueno", frete: 95, servicos: 95, locacao: 2520,
    itens: [{ prod: "ANDA", qtd: 6, nome: "Andaime tubular · 6 torres", patrimonio: "controle por quantidade · 6 un.", estado: "Locado", valor: 2520 }],
    memoria: [{ linha: "Andaime · 6 torres · 30 dias", valor: "R$ 2.520" }, { linha: "1 mensal × R$ 420 × 6", valor: "R$ 2.520" }, { linha: "Entrega e coleta", valor: "R$ 95" }, { linha: "Caução retida", valor: "R$ 900" }],
    linha: [{ q: "05 ago 07:41", t: "Orçamento criado", d: "Solicitação recebida pelo site", a: "Site" },
            { q: "05 ago 08:12", t: "Cliente aprovou", d: "Aprovação registrada com data e canal", a: "Cliente" },
            { q: "05 ago 08:20", t: "Reserva confirmada", d: "Disponibilidade comprometida de 05/08 a 04/09", a: "Sistema" },
            { q: "05 ago 09:05", t: "Contrato assinado", d: "PDF versão 1 arquivado e imutável", a: "Rafael M." },
            { q: "05 ago 09:40", t: "Separação concluída", d: "6 torres conferidas com checklist e fotos", a: "Rafael M." },
            { q: "05 ago 11:10", t: "Entrega confirmada", d: "Recebido por Juliana Aroeira · assinatura anexada", a: "Entregador" }],
    docs: [{ nome: "Orçamento", quando: "05 ago", ok: true }, { nome: "Contrato assinado", quando: "05 ago", ok: true }, { nome: "Checklist de saída", quando: "05 ago", ok: true }, { nome: "Comprovante de entrega", quando: "05 ago", ok: true }, { nome: "Termo de devolução", quando: "pendente", ok: false }] },
  { numero: "CT-2026-0132", clienteId: "CL-0027", inicio: "2026-07-25", fim: "2026-08-03", situacao: "Atrasado", pagamento: "Vencido", caucao: 600, caucaoSit: "Retida · pode ser abatida no fechamento",
    local: "Galpão Senador Canedo", endereco: "Rua 9, 415 · Senador Canedo", frete: 95, servicos: 95, locacao: 1040,
    itens: [{ prod: "GER5", nome: "Gerador 5 kVA", patrimonio: "GER-0001", estado: "Aguardando coleta", valor: 1040 }],
    memoria: [{ linha: "Gerador · 9 dias", valor: "R$ 1.040" }, { linha: "1 semanal × R$ 720", valor: "R$ 720" }, { linha: "2 diárias × R$ 160", valor: "R$ 320" }, { linha: "3 diárias em atraso × R$ 160", valor: "R$ 480" }, { linha: "Multa por atraso 10%", valor: "R$ 48" }],
    linha: [{ q: "25 jul 07:55", t: "Contrato assinado", d: "Faturado 30 dias · limite aprovado", a: "Rafael M." },
            { q: "25 jul 08:30", t: "Entrega confirmada", d: "GER-0001 entregue e vinculado ao contrato", a: "Entregador" },
            { q: "03 ago 18:00", t: "Prazo encerrado sem coleta", d: "Contrato passou a atrasado automaticamente", a: "Sistema" },
            { q: "05 ago 09:00", t: "Cobrança vencida", d: "Cliente bloqueado para novas locações", a: "Sistema" },
            { q: "06 ago 08:15", t: "Coleta agendada", d: "Prevista para hoje às 11h", a: "Rafael M." }],
    docs: [{ nome: "Contrato assinado", quando: "25 jul", ok: true }, { nome: "Checklist de saída", quando: "25 jul", ok: true }, { nome: "Comprovante de entrega", quando: "25 jul", ok: true }, { nome: "Notificação de atraso", quando: "04 ago", ok: true }, { nome: "Termo de devolução", quando: "pendente", ok: false }] },
  { numero: "CT-2026-0154", clienteId: "CL-0064", inicio: "2026-08-05", fim: "2026-08-12", situacao: "Em andamento", pagamento: "Pago", caucao: 500, caucaoSit: "Retida até a inspeção final",
    local: "Reforma Jardim América", endereco: "Rua C-140, 76 · Jardim América", frete: 60, servicos: 60, locacao: 630,
    itens: [{ prod: "PLACA", nome: "Placa vibratória", patrimonio: "PLA-0001", estado: "Locado", valor: 630 }],
    memoria: [{ linha: "Placa vibratória · 7 dias", valor: "R$ 630" }, { linha: "1 semanal × R$ 630", valor: "R$ 630" }, { linha: "Entrega e coleta", valor: "R$ 60" }, { linha: "Caução retida", valor: "R$ 500" }],
    linha: [{ q: "05 ago 10:20", t: "Contrato assinado", d: "Pagamento no Pix aprovado em segundos", a: "Rafael M." },
            { q: "05 ago 13:10", t: "Separação concluída", d: "PLA-0001 conferida com fotos de saída", a: "Rafael M." },
            { q: "05 ago 14:40", t: "Entrega confirmada", d: "Recebida por Fernanda Prado", a: "Entregador" }],
    docs: [{ nome: "Contrato assinado", quando: "05 ago", ok: true }, { nome: "Checklist de saída", quando: "05 ago", ok: true }, { nome: "Comprovante de entrega", quando: "05 ago", ok: true }] },
  { numero: "CT-2026-0155", clienteId: "CL-0058", inicio: "2026-08-06", fim: "2026-08-08", situacao: "Aguardando pagamento", pagamento: "Pix pendente", caucao: 250, caucaoSit: "Pendente",
    local: "Retirada na loja", endereco: "Balcão · Setor Norte Ferroviário", frete: 0, servicos: 0, locacao: 160,
    itens: [{ prod: "MART", nome: "Martelete rompedor", patrimonio: "MAR-0003 · reservado", estado: "Reservado", valor: 160 }],
    memoria: [{ linha: "Martelete · 2 dias", valor: "R$ 160" }, { linha: "2 diárias × R$ 80", valor: "R$ 160" }, { linha: "Caução", valor: "R$ 250" }],
    linha: [{ q: "06 ago 08:03", t: "Reserva criada pelo site", d: "Válida por 24 h ou até o pagamento", a: "Site" },
            { q: "06 ago 08:04", t: "Pix gerado sem confirmação", d: "Equipamento comprometido até 07 ago 08:03", a: "Gateway" }],
    docs: [{ nome: "Orçamento", quando: "06 ago", ok: true }, { nome: "Contrato assinado", quando: "pendente", ok: false }] },
  { numero: "CT-2026-0129", clienteId: "CL-0027", inicio: "2026-08-01", fim: "2026-08-20", situacao: "Em andamento", pagamento: "Pago", caucao: 250, caucaoSit: "Retida até a inspeção final",
    local: "Edifício Central", endereco: "Av. Anhanguera, 4120 · Centro", frete: 60, servicos: 60, locacao: 1120,
    itens: [{ prod: "MART", nome: "Martelete rompedor", patrimonio: "MAR-0001", estado: "Locado", valor: 1120 }],
    memoria: [{ linha: "Martelete · 19 dias", valor: "R$ 1.120" }, { linha: "2 semanais × R$ 360", valor: "R$ 720" }, { linha: "5 diárias × R$ 80", valor: "R$ 400" }, { linha: "Entrega e coleta", valor: "R$ 60" }],
    linha: [{ q: "31/07 14:12", t: "Contrato assinado", d: "Gerado a partir do pedido PED-000122", a: "Rafael M." },
            { q: "01/08 08:40", t: "Separação concluída", d: "MAR-0001 conferido com fotos de saída", a: "Rafael M." },
            { q: "01/08 10:15", t: "Entrega confirmada", d: "Recebido por Wesley Torres", a: "Entregador" }],
    docs: [{ nome: "Orçamento", quando: "31 jul", ok: true }, { nome: "Contrato assinado", quando: "31 jul", ok: true }, { nome: "Checklist de saída", quando: "01 ago", ok: true }, { nome: "Comprovante de entrega", quando: "01 ago", ok: true }, { nome: "Termo de devolução", quando: "pendente", ok: false }] },
  { numero: "CT-2026-0139", clienteId: "CL-0043", inicio: "2026-08-01", fim: "2026-08-05", situacao: "Em inspeção", pagamento: "Pago", caucao: 350, caucaoSit: "Retida · devolução após liberação",
    local: "Retirada na loja", endereco: "Balcão · Setor Norte Ferroviário", frete: 0, servicos: 0, locacao: 440,
    itens: [{ prod: "LAV", nome: "Lavadora de alta pressão", patrimonio: "LAV-0001", estado: "Em inspeção", valor: 440 }],
    memoria: [{ linha: "Lavadora · 4 dias", valor: "R$ 440" }, { linha: "4 diárias × R$ 110", valor: "R$ 440" }, { linha: "Caução retida", valor: "R$ 350" }],
    linha: [{ q: "01 ago 08:30", t: "Retirada no balcão", d: "Documento conferido e 4 fotos de saída anexadas", a: "Rafael M." },
            { q: "05 ago 09:00", t: "Devolução recebida", d: "Acessórios conferidos: pistola, lança e bicos", a: "Rafael M." },
            { q: "05 ago 09:10", t: "Enviada para inspeção", d: "Equipamento não volta direto ao estoque", a: "Sistema" }],
    docs: [{ nome: "Contrato assinado", quando: "01 ago", ok: true }, { nome: "Checklist de saída", quando: "01 ago", ok: true }, { nome: "Checklist de devolução", quando: "05 ago", ok: true }, { nome: "Laudo de inspeção", quando: "pendente", ok: false }] },
];

export const COMPOSICOES = [
  { id: "KIT-MART", nome: "Kit Martelete rompedor", principal: "MART",
    inclusos: ["Martelete rompedor", "Maleta de transporte", "Ponteiro", "Talhadeira"],
    opcionais: [{ nome: "Extensão elétrica 20 m", valor: 25 }, { nome: "Broca SDS 16 mm", valor: 18 }, { nome: "Ponteiro extra", valor: 15 }],
    nota: "Conferido item por item na saída e na devolução. Falta de acessório vira ocorrência." },
  { id: "KIT-BET", nome: "Kit Betoneira 400 L", principal: "BET400",
    inclusos: ["Betoneira 400 L", "Manual de operação", "Chave de regulagem"],
    opcionais: [{ nome: "Extensão elétrica 20 m", valor: 25 }, { nome: "Carrinho de apoio", valor: 30 }],
    nota: "A extensão é o item mais esquecido na obra. Sempre conferir na coleta." },
  { id: "KIT-ANDA", nome: "Kit Andaime torre completa", principal: "ANDA",
    inclusos: ["Torre tubular", "Piso metálico", "Rodízios", "Diagonais"],
    opcionais: [{ nome: "Guarda-corpo", valor: 12 }, { nome: "Sapata reguladora", valor: 8 }],
    nota: "Guarda-corpo é obrigatório acima de 2 m pela NR-35. Oferecer sempre." },
  { id: "KIT-CORT", nome: "Kit Cortadora de piso", principal: "CORT",
    inclusos: ["Cortadora de piso", "Disco diamantado 350 mm", "Chaves de troca"],
    opcionais: [{ nome: "Disco extra", valor: 190 }, { nome: "Reservatório de água", valor: 40 }],
    nota: "Disco é medido por desgaste na devolução. Acima de 30% de perda vira cobrança." },
];

export interface Pedido {
  num: string; clienteId: string; obra: string; entrega: string; inicio: string; fim: string; status: string; criado: string; autor: string;
  itens: { prod: string; qtd: number }[]; servicos: string[]; desconto: number; forma: string;
  servicosDetalhes?: { nome:string; natureza:string; valor:number }[];
  frete?: number;
  versoes: { v: number; valor: number; quando: string; nota: string; ativa?: boolean }[];
  contrato?: string; linha: { q: string; t: string; d: string; a: string }[];
}

export const PEDIDOS: Pedido[] = [
  { num: "PED-000124", clienteId: "CL-0011", obra: "Residencial Alfa", entrega: "obra",
    inicio: "2026-08-10", fim: "2026-08-18", status: "Orçamento enviado", criado: "06/08 14:32", autor: "Rafael M.",
    itens: [{ prod: "BET400", qtd: 1 }, { prod: "ANDA", qtd: 4 }], servicos: ["Entrega e coleta"], desconto: 80, forma: "Boleto",
    versoes: [
      { v: 1, valor: 1420, quando: "06/08 14:37", nota: "Sem desconto, entrega inclusa" },
      { v: 2, valor: 1340, quando: "06/08 15:21", nota: "Desconto de R$ 80 aprovado pelo gerente", ativa: true },
    ],
    linha: [
      { q: "06/08 14:32", t: "Pedido criado", d: "Aberto no balcão a partir de ligação do cliente", a: "Rafael M." },
      { q: "06/08 14:37", t: "Orçamento v1 gerado", d: "R$ 1.420 · validade de 3 dias", a: "Rafael M." },
      { q: "06/08 14:38", t: "Enviado por WhatsApp", d: "Para Juliana Aroeira · (62) 3251-8890", a: "Sistema" },
      { q: "06/08 15:18", t: "Cliente pediu revisão", d: "Achou o andaime caro para 8 dias", a: "Rafael M." },
      { q: "06/08 15:20", t: "Desconto aplicado", d: "R$ 80 no andaime, dentro da alçada do gerente", a: "Wesley (gerente)" },
      { q: "06/08 15:21", t: "Orçamento v2 gerado", d: "R$ 1.340 · substitui a v1", a: "Rafael M." },
    ] },
  { num: "PED-000126", clienteId: "CL-0043", obra: "", entrega: "loja",
    inicio: "2026-08-12", fim: "2026-08-14", status: "Rascunho", criado: "07/08 08:14", autor: "Rafael M.",
    itens: [{ prod: "MART", qtd: 1 }], servicos: [], desconto: 0, forma: "Pix", versoes: [],
    linha: [{ q: "07/08 08:14", t: "Pedido criado", d: "Cliente ainda decidindo o período", a: "Rafael M." }] },
  { num: "PED-000125", clienteId: "CL-0064", obra: "Reforma Jardim América", entrega: "obra",
    inicio: "2026-08-18", fim: "2026-08-22", status: "Aguardando aprovação", criado: "06/08 17:40", autor: "Rafael M.",
    itens: [{ prod: "PLACA", qtd: 1 }], servicos: ["Entrega e coleta"], desconto: 0, forma: "Pix",
    versoes: [{ v: 1, valor: 620, quando: "06/08 17:45", nota: "Semanal + frete", ativa: true }],
    linha: [
      { q: "06/08 17:40", t: "Pedido criado", d: "Cliente veio pelo site e ligou em seguida", a: "Rafael M." },
      { q: "06/08 17:45", t: "Orçamento v1 gerado", d: "R$ 620 · validade de 2 dias", a: "Rafael M." },
      { q: "06/08 17:46", t: "Pré-reserva criada", d: "PLA-0002 comprometida até 08/08 18h", a: "Sistema" },
    ] },
  { num: "PED-000122", clienteId: "CL-0027", obra: "Edifício Central", entrega: "obra",
    inicio: "2026-08-01", fim: "2026-08-20", status: "Aprovado", criado: "31/07 09:10", autor: "Rafael M.",
    itens: [{ prod: "MART", qtd: 1 }], servicos: ["Entrega e coleta"], desconto: 0, forma: "Boleto",
    versoes: [{ v: 1, valor: 1180, quando: "31/07 09:22", nota: "Faturado 30 dias", ativa: true }], contrato: "CT-2026-0129",
    linha: [
      { q: "31/07 09:10", t: "Pedido criado", d: "Solicitação por e-mail do setor de compras", a: "Rafael M." },
      { q: "31/07 09:22", t: "Orçamento v1 gerado", d: "R$ 1.180", a: "Rafael M." },
      { q: "31/07 14:05", t: "Cliente aprovou", d: "Aprovação por e-mail, anexada ao pedido", a: "Cliente" },
      { q: "31/07 14:08", t: "Reserva confirmada", d: "1 martelete de 01/08 a 20/08", a: "Sistema" },
      { q: "31/07 14:12", t: "Contrato CT-2026-0129 gerado", d: "Preço congelado na assinatura", a: "Rafael M." },
    ] },
  { num: "PED-000119", clienteId: "CL-0058", obra: "", entrega: "loja",
    inicio: "2026-08-03", fim: "2026-08-05", status: "Cancelado", criado: "02/08 11:20", autor: "Rafael M.",
    itens: [{ prod: "CORT", qtd: 1 }], servicos: [], desconto: 0, forma: "Pix",
    versoes: [{ v: 1, valor: 540, quando: "02/08 11:26", nota: "Cortadora por 3 dias", ativa: true }],
    linha: [
      { q: "02/08 11:20", t: "Pedido criado", d: "Cliente perguntou no balcão", a: "Rafael M." },
      { q: "02/08 11:26", t: "Orçamento v1 gerado", d: "R$ 540", a: "Rafael M." },
      { q: "05/08 08:00", t: "Orçamento expirado", d: "Sem resposta em 3 dias · pré-reserva liberada", a: "Sistema" },
      { q: "05/08 08:00", t: "Pedido cancelado", d: "Equipamento devolvido ao estoque disponível", a: "Sistema" },
    ] },
];

export const COMPROMISSOS = [
  { prod: "ANDA", pat: null, inicio: "2026-08-05", fim: "2026-09-04", tipo: "locado", qtd: 6, ref: "CT-2026-0148" },
  { prod: "GER5", pat: "GER-0001", inicio: "2026-07-25", fim: "2026-08-09", tipo: "locado", qtd: 1, ref: "CT-2026-0132" },
  { prod: "PLACA", pat: "PLA-0001", inicio: "2026-08-05", fim: "2026-08-12", tipo: "locado", qtd: 1, ref: "CT-2026-0154" },
  { prod: "MART", pat: "MAR-0003", inicio: "2026-08-06", fim: "2026-08-08", tipo: "reservado", qtd: 1, ref: "CT-2026-0155" },
  { prod: "MART", pat: "MAR-0001", inicio: "2026-08-01", fim: "2026-08-20", tipo: "locado", qtd: 1, ref: "CT-2026-0129" },
  { prod: "BET400", pat: "BET-0002", inicio: "2026-08-01", fim: "2026-08-25", tipo: "locado", qtd: 1, ref: "CT-2026-0126" },
  { prod: "BET400", pat: "BET-0003", inicio: "2026-07-28", fim: "2026-08-14", tipo: "manutencao", qtd: 1, ref: "OM-0044" },
  { prod: "BET400", pat: "BET-0004", inicio: "2026-08-06", fim: "2026-08-07", tipo: "manutencao", qtd: 1, ref: "OM-0047" },
  { prod: "LAV", pat: "LAV-0001", inicio: "2026-08-05", fim: "2026-08-07", tipo: "manutencao", qtd: 1, ref: "OM-0045" },
  { prod: "PLACA", pat: "PLA-0002", inicio: "2026-08-18", fim: "2026-08-22", tipo: "reservado", qtd: 1, ref: "CT-2026-0158" },
];

export const COBRANCAS = [
  { ref: "CB-0311", contrato: "CT-2026-0132", cliente: "Obras JR Engenharia", desc: "Locação gerador + atraso", venc: "01 ago 2026", valor: 1868, situacao: "Vencida" },
  { ref: "CB-0318", contrato: "CT-2026-0148", cliente: "Construtora Aroeira", desc: "Locação andaime · parcela 1", venc: "10 ago 2026", valor: 1307, situacao: "Pendente" },
  { ref: "CB-0322", contrato: "CT-2026-0155", cliente: "Elton Ribeiro", desc: "Locação martelete + caução", venc: "06 ago 2026", valor: 410, situacao: "Pendente" },
  { ref: "CB-0309", contrato: "CT-2026-0154", cliente: "Fernanda Prado", desc: "Locação placa vibratória", venc: "05 ago 2026", valor: 1190, situacao: "Paga" },
  { ref: "CB-0301", contrato: "CT-2026-0139", cliente: "Marcos Vieira", desc: "Locação lavadora", venc: "01 ago 2026", valor: 790, situacao: "Paga" },
  { ref: "CB-0295", contrato: "CT-2026-0121", cliente: "Marcos Vieira", desc: "Locação vibrador de concreto", venc: "21 jul 2026", valor: 570, situacao: "Paga" },
];

export const MANUTENCOES = [
  { ref: "OM-0044", patrimonio: "BET-0003", equip: "Betoneira 400 L", tipo: "Corretiva", defeito: "Correia rompida e rolamento com ruído", situacao: "Em execução", previsao: "14 ago", custo: 480 },
  { ref: "OM-0045", patrimonio: "LAV-0001", equip: "Lavadora de alta pressão", tipo: "Inspeção", defeito: "Conferência pós-devolução", situacao: "Aguardando diagnóstico", previsao: "07 ago", custo: 0 },
  { ref: "OM-0046", patrimonio: "GER-0001", equip: "Gerador 5 kVA", tipo: "Preventiva", defeito: "Revisão de 750 h vencida", situacao: "Aberta", previsao: "12 ago", custo: 0 },
  { ref: "OM-0043", patrimonio: "PLA-0002", equip: "Placa vibratória", tipo: "Preventiva", defeito: "Troca de óleo e filtro", situacao: "Concluída", previsao: "02 ago", custo: 260 },
];

export const AGENDA = [
  { hora: "08:00", tipo: "Entrega", titulo: "Construtora Aroeira", sub: "6 torres de andaime · Residencial Alfa", ref: "CT-2026-0148", contrato: "CT-2026-0148", alerta: false },
  { hora: "09:30", tipo: "Inspeção", titulo: "Lavadora de alta pressão", sub: "LAV-0001 aguardando liberação após devolução", ref: "OM-0045", contrato: "CT-2026-0139", alerta: false },
  { hora: "11:00", tipo: "Coleta", titulo: "Obras JR Engenharia", sub: "Gerador 5 kVA · atrasado há 3 dias", ref: "CT-2026-0132", contrato: "CT-2026-0132", alerta: true },
  { hora: "13:00", tipo: "Retirada", titulo: "Elton Ribeiro", sub: "Martelete rompedor · aguardando confirmação do Pix", ref: "CT-2026-0155", contrato: "CT-2026-0155", alerta: true },
  { hora: "16:00", tipo: "Coleta", titulo: "Fernanda Prado", sub: "Placa vibratória · coleta após as 15h", ref: "CT-2026-0154", contrato: "CT-2026-0154", alerta: false },
];

export const CHECKLIST = [
  { item: "Liga e opera corretamente", critico: true },
  { item: "Estrutura sem trinca ou empeno", critico: true },
  { item: "Cabo e plugue íntegros", critico: true },
  { item: "Proteções e carenagem no lugar", critico: true },
  { item: "Rodas e apoios em ordem", critico: false },
  { item: "Limpeza aprovada", critico: false },
  { item: "Acessórios da composição conferidos", critico: true },
  { item: "Horímetro e combustível registrados", critico: false },
];

export const EXTRAS = [
  { nome: "Entrega e coleta", natureza: "Serviço · NFS-e", valor: 95 },
  { nome: "Operador por diária", natureza: "Serviço · NFS-e", valor: 280 },
  { nome: "Disco diamantado 350 mm", natureza: "Mercadoria · NF-e", valor: 190 },
  { nome: "Combustível para teste inicial", natureza: "Mercadoria · NF-e", valor: 60 },
];

export const ETAPAS = ["Cliente", "Local", "Datas", "Equipamentos", "Serviços", "Pagamento", "Revisão"];

// ---- estados / cores ----
export const COR_ESTADO: Record<string, string> = {
  "Disponível": "#2DBE70", "Reservado": "#7FA9C9", "Em separação": "#F3B340",
  "Locado": "#F36F0A", "Aguardando coleta": "#F3B340", "Em inspeção": "#7FA9C9",
  "Em manutenção": "#E05252", "Avariado": "#E05252", "Baixado": "#8A9299",
};
export const STATUS_PEDIDO: Record<string, string> = {
  "Rascunho": "#8A9299", "Orçamento enviado": "#7FA9C9", "Aguardando aprovação": "#F3B340",
  "Aprovado": "#2DBE70", "Cancelado": "#E05252",
};
export const FASE_CONTRATO: Record<string, string> = {
  "Aguardando pagamento": "Aguardando saída", "Em andamento": "Ativo",
  "Em inspeção": "Aguardando devolução", "Atrasado": "Atrasado",
};
export const COR_COMP: Record<string, string> = { locado: "#F36F0A", reservado: "#7FA9C9", manutencao: "#E05252" };
export const NOME_COMP: Record<string, string> = { locado: "Locado", reservado: "Reservado", manutencao: "Manutenção" };
