export const EMPRESA = {
  nome: "LOCAGO",
  descricao: "Aluguel de equipamentos para construção em Goiânia e região metropolitana",
  telefone: "(62) 99234-5678",
  telefoneRaw: "+5562992345678",
  email: "contato@locago.com.br",
  cidade: "Goiânia - GO",
  horario: "Seg a Sex, 7h às 18h · Sáb, 7h às 12h",
};

export function whatsappLink(mensagem: string) {
  return `https://wa.me/${EMPRESA.telefoneRaw.replace("+", "")}?text=${encodeURIComponent(mensagem)}`;
}

export const REGIOES = [
  "Goiânia",
  "Aparecida de Goiânia",
  "Senador Canedo",
  "Trindade",
  "Goianira",
  "Nerópolis",
  "Hidrolândia",
  "Bela Vista de Goiás",
];
