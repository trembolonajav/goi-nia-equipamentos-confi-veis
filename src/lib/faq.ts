export type FaqItem = { q: string; a: string; home?: boolean };

export const FAQ_ITENS: FaqItem[] = [
  {
    q: "Como faço para alugar um equipamento?",
    a: "Escolha o equipamento no catálogo e clique em pedir orçamento, ou fale direto no WhatsApp informando o equipamento, o período e o endereço da obra. Respondemos com valor e disponibilidade em poucos minutos no horário comercial.",
    home: true,
  },
  {
    q: "Quanto custa a diária, a semana ou o mês?",
    a: "Trabalhamos com diária, semanal, quinzenal e mensal — quanto maior o prazo, melhor o valor proporcional. Como o preço varia por modelo, período e frete, o valor exato é informado no orçamento, sempre antes de você fechar e sem taxa escondida.",
    home: true,
  },
  {
    q: "Vocês entregam na obra? Como funciona o frete?",
    a: "Sim. Entregamos e retiramos em Goiânia e região metropolitana, normalmente no mesmo dia ou no dia seguinte à confirmação. O frete é calculado pela distância até a obra e pelo porte do equipamento, e vai informado no orçamento. Você também pode retirar na loja.",
    home: true,
  },
  {
    q: "Como sei se o equipamento está disponível na minha data?",
    a: "Informe a data de início e o período estimado no pedido de orçamento. Conferimos a agenda do equipamento e confirmamos a reserva pelo WhatsApp. Se o item estiver comprometido, indicamos um equivalente para a mesma data.",
    home: true,
  },
  {
    q: "Quais documentos, caução ou garantia são exigidos?",
    a: "Pessoa física: documento com foto e comprovante de endereço atualizado. Empresa: CNPJ e dados do responsável pela retirada. Em alguns equipamentos de maior valor pode ser solicitada caução ou garantia, sempre informada antes da locação, junto do contrato.",
    home: true,
  },
  {
    q: "O que acontece se o equipamento apresentar defeito?",
    a: "Caso o equipamento apresente falha ou pare de funcionar durante a locação, o cliente deve interromper o uso e comunicar imediatamente a LOCAGO. Quando o problema não estiver relacionado ao uso inadequado, prestamos assistência ou realizamos a substituição do equipamento com a maior brevidade possível, conforme disponibilidade. Danos causados por mau uso, negligência, operação em desacordo com as orientações, quedas, sobrecarga, perda ou avarias são de responsabilidade do cliente, conforme as condições do contrato de locação. Não tente desmontar ou reparar o equipamento sem autorização da LOCAGO.",
    home: true,
  },
  {
    q: "Os equipamentos são revisados antes da entrega?",
    a: "Sim. Todo equipamento passa por revisão, limpeza e teste de funcionamento antes de sair para a obra. Na entrega, explicamos a operação correta e os EPIs recomendados.",
  },
  {
    q: "Não sei qual equipamento preciso. Vocês orientam?",
    a: "Sim, e é comum. Diga o serviço que você vai executar — quebrar concreto, compactar solo, misturar argamassa, trabalhar em altura — e indicamos o equipamento certo, o porte adequado e os acessórios necessários.",
  },
  {
    q: "Posso estender o período da locação?",
    a: "Pode. Avise antes do fim do prazo e prorrogamos na mesma condição, conforme a disponibilidade do equipamento. A prorrogação é confirmada por escrito no WhatsApp.",
  },
  {
    q: "Qual o prazo mínimo e como conta o período?",
    a: "O prazo mínimo é a diária. O período começa a contar na entrega do equipamento na obra (ou na retirada em loja) e termina na data combinada para devolução ou coleta.",
  },
  {
    q: "Preciso estar presente na entrega?",
    a: "Alguém responsável precisa receber o equipamento, conferir as condições e assinar o comprovante. Pode ser o mestre de obra ou outra pessoa indicada por você.",
  },
  {
    q: "Combustível, água e energia são por conta de quem?",
    a: "Equipamentos a combustão são entregues com o suficiente para teste; o abastecimento durante a locação é por conta do cliente. Ponto de energia, água e as condições do local também são responsabilidade do contratante.",
  },
];

export const FAQ_HOME = FAQ_ITENS.filter((i) => i.home);
