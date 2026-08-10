# LOCAGO — Sistema interno (protótipo)

Protótipo de front-end (React + TypeScript + Vite) do sistema interno da **LOCAGO —
Aluguel de Equipamentos** (Goiânia-GO). Sem back-end e sem banco: todo o estado vive no
navegador (`localStorage`), então você pode criar dados de verdade e ver o fluxo real.

## Rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Backend e banco de dados

A primeira API funcional cobre o módulo **Atendimento** (clientes e pedidos). Ela usa Java 17, Spring Boot, PostgreSQL e Flyway.

```bash
docker compose up -d --build
npm run dev
```

- Site e sistema: `http://localhost:5173`
- API: `http://localhost:8081/api/atendimento`
- Saúde da API: `http://localhost:8081/actuator/health`
- PostgreSQL: `localhost:5433` (banco/usuário `locago`)

Os mocks continuam visíveis. Clientes e pedidos novos são gravados no PostgreSQL e carregados novamente pela API. A aprovação salva contrato, reservas, cobrança da locação e caução separada em uma única transação. Contratos com entrega em obra geram tarefas reais de entrega e coleta. A expedição conclui a entrega e retém a caução; a devolução conclui a coleta e envia os itens para inspeção. Uma inspeção aprovada libera patrimônio e caução; uma avaria abre manutenção e mantém a caução em análise. Contas a receber aceita pagamentos parciais e totais sem misturar caução com receita.

O cadastro de clientes valida CPF/CNPJ pelos dígitos verificadores, telefone com DDD, e-mail e endereço obrigatório tanto no navegador quanto na API. Documentos PDF, JPG e PNG de até 10 MB podem ser anexados durante o cadastro ou na ficha do cliente, baixados e excluídos. Os arquivos ficam no volume Docker persistente `locago_uploads`, e seus metadados ficam no PostgreSQL.

### Rotas

- `/site` — **site público** (Home, Catálogo, Equipamento, Checkout, Dúvidas), sem login.
- `/login` — entrada do sistema interno.
- `/app` — **sistema interno** (protegido). A raiz `/` redireciona para o site.

Os dados (equipamentos, clientes, contratos, pedidos, patrimônios, cobranças, manutenções,
agenda) são os mesmos do mockup "Sistema LOCAGO v2" e do "Site LOCAGO".

### Acessos de teste

| Usuário  | Senha    | Papel                |
|----------|----------|----------------------|
| `admin`  | `locago` | administrador        |
| `balcao` | `locago` | atendente de balcão  |

## O que já funciona (fluxo real, com persistência)

- **Login** com rota protegida.
- **Início / Atenção hoje** — KPIs calculados dos dados (expedições, devoluções atrasadas,
  orçamentos, cobranças vencidas, manutenção), agenda do dia, situação da frota e financeiro.
- **Nova locação** (assistente de 7 etapas): cliente → retirada/obra → período →
  equipamentos → serviços → pagamento → revisão. Calcula a **melhor combinação de tabela**
  (diária/semanal/quinzenal/mensal), mostra a memória de cálculo, valida bloqueios/avisos e
  gera **orçamento** ou fecha direto como **aprovado**.
- **Pedidos** — lista, detalhe e **aprovar → gera contrato + cobrança**.
- **Contratos** — lista, detalhe, linha do tempo e ações **expedir** (aloca patrimônio real e
  muda estados) e **devolver** (encerra e libera caução).
- **Expedições** — fila dos contratos aguardando saída.
- **Equipamentos** — catálogo com **disponibilidade por período** (desconta locações,
  reservas e manutenção que se sobrepõem às datas) e ficha do produto.
- **Clientes** — lista, ficha com abas (cadastro, contratos, obras, documentos, cobranças) e
  **cadastro novo** (bloqueia documento duplicado, bloquear/reativar).
- **Obras**, **Patrimônios**, **Calendário de ocupação** e **Cobranças** (receber, KPIs).

## Onde ficam as coisas

```
src/
  auth/          login + contexto de autenticação (mock)
  data/          seed (dados mock) + store (localStorage, CRUD, disponibilidade)
  lib/           formatação, precificação (melhor tabela), imagens
  components/    Layout (sidebar/header/busca), UI (tags, toast, thumb)
  pages/         uma tela por arquivo
  types.ts       modelo de domínio
```

Para **limpar os dados** e voltar à semente: apague a chave `locago:db:v3` no
`localStorage` do navegador (DevTools → Application → Local Storage) e recarregue.

## Próximas fases (roadmap)

Composições (kits), regras de faturamento, NFS-e/boleto, e a troca por um back-end real
(as telas de _Composições_ e _Configurações_ já ficam marcadas como "Em breve").

> Identidade visual e mapa de telas baseados no material de design da LOCAGO
> (paleta laranja `#F36F0A` / grafite, tipografia Rajdhani + Inter).
