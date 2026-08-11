# LOCAGO — Sistema de locação de equipamentos

Sistema público e operacional da **LOCAGO — Aluguel de Equipamentos**, em Goiânia/GO. O projeto reúne o site de divulgação e um sistema interno persistente para atendimento, contratos, movimentação individual dos equipamentos, manutenção, cobrança e financeiro.

## Stack

- Frontend: React 19, TypeScript e Vite.
- Backend: Java 17, Spring Boot 3 e JDBC.
- Banco: PostgreSQL com migrations Flyway.
- Infraestrutura local: Docker Compose e volume persistente para documentos.

O PostgreSQL é a fonte de verdade dos módulos já integrados. Dados de compatibilidade visual ainda existentes no frontend não substituem a persistência do Core.

## Executar localmente

Pré-requisitos: Docker Desktop, Node.js e npm.

```bash
docker compose -f compose.yml up -d --build
npm install
npm run dev
```

- Site e sistema: `http://localhost:5173`
- API: `http://localhost:8081/api/atendimento`
- Saúde da API: `http://localhost:8081/actuator/health`
- PostgreSQL: `localhost:5433` — banco e usuário `locago`

Para acompanhar os serviços:

```bash
docker compose -f compose.yml ps
docker compose -f compose.yml logs -f backend
```

## Fluxos implementados

- Clientes PF/PJ com validações, endereço estruturado, busca por CEP e documentos.
- Produtos, categorias, patrimônios individuais, composições, disponibilidade e calendário.
- Atendimento, orçamento, pedido, aprovação e geração de contrato.
- Operação parcial por item e patrimônio: saída, entrega, devolução, inspeção e manutenção.
- Comprovante assinado próprio para cada movimento de entrega parcial.
- Histórico imutável de movimentações dos patrimônios.
- Cobranças com recebimentos parciais, conta financeira de destino e estorno por reversão.
- Contas a pagar separadas do caixa; a saída financeira nasce somente na liquidação.
- Visão financeira cujo saldo, entradas e saídas vêm de lançamentos realizados; valores a receber e a pagar vêm das respectivas obrigações.
- Trocas, ocorrências, agenda logística e documentos operacionais.

O Core atual não utiliza caução. NFS-e, gateways de pagamento e automações externas estão fora desta fundação.

## Regras centrais

- `contrato_item` representa a linha comercial contratada.
- `contrato_item_patrimonio` associa as unidades físicas que cumprem essa linha.
- Um patrimônio não pode estar ligado simultaneamente a dois itens ativos.
- Expedição, entrega, devolução e inspeção são transacionais e podem ser parciais.
- O contrato só encerra quando todos os itens terminarem ou forem cancelados.
- Recebimentos e pagamentos só alteram caixa por lançamentos vinculados a uma conta financeira.
- Estornos preservam o evento original e criam uma reversão auditável.

A especificação completa está em [`docs/LOCAGO_CORE.md`](docs/LOCAGO_CORE.md).

## Banco e migrations

As migrations ficam em `backend/src/main/resources/db/migration` e são aplicadas automaticamente pelo Flyway. A sequência atual vai de **V1 a V22**. V20/V21 normalizam orçamento, versões, itens, serviços e a rastreabilidade até pedido e contrato. V22 separa os componentes financeiros e reforça no banco a imutabilidade das versões comerciais enviadas.

Não edite migration já publicada. Toda evolução compatível deve entrar em uma nova versão.

## Validação

```bash
cd backend
mvn test
cd ..
npm run build
```

Além dos testes automatizados, mudanças de domínio devem ser validadas em banco novo e em banco existente. O cenário crítico do Core é: contrato com múltiplos patrimônios, expedição parcial, entrega parcial com comprovante próprio, devolução individual, inspeção individual e preservação do estado dos demais itens.

## Rotas principais

- `/site` — site público.
- `/login` — acesso ao sistema interno.
- `/app` — início do sistema interno.
- `/app/nova-locacao` — atendimento e orçamento.
- `/app/contratos` — contratos e operação.
- `/app/expedicoes` — saídas e entregas pendentes.
- `/app/produtos`, `/app/patrimonios`, `/app/calendario` — equipamentos.
- `/app/financeiro`, `/app/fluxo-caixa`, `/app/cobrancas`, `/app/contas-pagar` — financeiro.

## Acesso local de demonstração

| Usuário | Senha | Papel |
|---|---|---|
| `admin` | `locago` | administrador |
| `balcao` | `locago` | atendente de balcão |

## Estado do projeto

**LOCAGO Core Foundation V1 — CLOSED.**

**Marco 2 — Normalização Comercial:** orçamento e suas versões são persistidos; versões enviadas são imutáveis; a aprovação usa o identificador explícito da versão e materializa, em uma única transação, pedido, contrato, itens, serviços, reservas e cobrança. Novos pedidos e contratos só podem nascer de uma versão persistida e aprovada. Documentos históricos usam os snapshots gravados, mesmo que o catálogo seja alterado posteriormente.
