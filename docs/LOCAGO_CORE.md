# LOCAGO Core — modelo definitivo

## Objetivo

O LOCAGO Core é o sistema operacional e financeiro essencial da loja. A interface deve ser simples para uma equipe pequena; banco e backend devem preservar rastreabilidade e evolução segura.

Regra central: complexidade no domínio e no banco, simplicidade na operação diária.

## Escopo visível da primeira versão

1. **Início** — entregas, devoluções, cobranças e manutenções pendentes.
2. **Atendimento** — orçamentos, pedidos e clientes.
3. **Locações** — contratos, expedições, devoluções e manutenção.
4. **Equipamentos** — produtos, patrimônios, disponibilidade e calendário.
5. **Financeiro** — visão geral, cobranças, contas a pagar e fluxo de caixa.
6. **Configurações** — serviços, preços e modelos de documentos.

Filiais, conciliação bancária, integrações fiscais, gateways, portal do cliente, BI, compras e permissões avançadas ficam fora desta fase.

## Fluxo operacional

```text
Orçamento -> Pedido aprovado -> Contrato -> Reserva -> Expedição parcial/total
          -> Devolução parcial/total -> Inspeção por patrimônio -> Encerramento
```

- Orçamento é uma proposta versionável e não reserva patrimônio.
- Pedido aprovado congela condições e origina o contrato.
- Contrato é o centro da operação, mas não é lançamento financeiro.
- Cada equipamento contratado é um `contrato_item` independente.
- `contrato_item_patrimonio` vincula unidades físicas ao item.
- Expedição, devolução e inspeção recebem seleção explícita; não movimentam obrigatoriamente o contrato inteiro.
- Manutenção bloqueia o patrimônio e registra custo e evidências.

## Fluxo financeiro

```text
Contrato -> Cobrança -> Itens da cobrança -> Recebimento
         -> Conta financeira -> Lançamento -> Saldo

Conta a pagar -> Pagamento -> Lançamento de saída -> Saldo
```

- **Cobrança** responde quanto e quando o cliente deve.
- **Cobrança item** detalha produto, serviço ou ajuste e seu período quando aplicável.
- **Recebimento** registra pagamentos parciais, forma, data, conta e responsável.
- **Conta financeira** informa onde o dinheiro entrou ou saiu.
- **Lançamento financeiro** é a única entidade que altera saldo realizado.
- **Conta a pagar** representa a obrigação; seu pagamento gera uma saída.
- Nenhuma conta fictícia é criada. O operador escolhe uma conta existente; a interface pode pré-selecionar a única opção disponível.
- Estorno não apaga histórico: registra responsável/data e cria reversão auditável.
- Caução não faz parte do LOCAGO Core atual.

## Estados

### Cobrança

`ABERTA -> PARCIAL -> PAGA`. `VENCIDA` é calculada pela data. `CANCELADA` é ação explícita, com `cancelada_em` e `cancelada_por`.

### Contrato e itens

O estado detalhado pertence ao `contrato_item`: `RESERVADO`, `A_EXPEDIR`, `LOCADO`, `DEVOLVIDO`, `EM_INSPECAO`, `EM_MANUTENCAO`, `FINALIZADO` ou `CANCELADO`.

O status do contrato é agregado dos itens. Um contrato pode estar parcialmente expedido, devolvido ou inspecionado. Ele encerra somente quando todos os itens estiverem finalizados ou cancelados.

### Patrimônio

`DISPONIVEL`, `RESERVADO`, `LOCADO`, `EM_INSPECAO`, `MANUTENCAO`.

## Modelo essencial

- `cliente`: PF/PJ, documento, contatos e endereço estruturado.
- `produto`: categoria, código, nome, marca, modelo, preços e regras.
- `patrimonio`: unidade física, série, horímetro, estado e localização.
- `orcamento`, `orcamento_versao`, `orcamento_item`.
- `pedido`, `pedido_item`.
- `contrato`, `contrato_item`, `contrato_item_patrimonio`.
- `movimentacao_patrimonio`: histórico imutável de reserva, saída, retorno, inspeção, manutenção e liberação.
- `cobranca`, `cobranca_item`.
- `recebimento`: pagamento, conta, forma, data, criador e eventual estorno.
- `conta_financeira`, `lancamento_financeiro`.
- `conta_pagar`, `pagamento_conta`.
- `manutencao` e seus anexos.
- `auditoria_evento`.

Não existe `periodo_cobranca` separado nesta fase; período inicial/final pertence a `cobranca_item`. Valores monetários usam `numeric(14,2)` e `BigDecimal`.

## Invariantes do Core

- Dinheiro somente altera saldo por lançamento vinculado a conta existente.
- Recebimento parcial não quita cobrança com saldo remanescente.
- Estorno preserva o registro original e produz reversão auditável.
- Patrimônio não pode estar simultaneamente vinculado a dois itens ativos.
- Toda mudança de estado do patrimônio gera `movimentacao_patrimonio`; histórico não é sobrescrito.
- Expedição, devolução e inspeção aceitam operações parciais.
- Documentos e valores contratados são snapshots e não mudam com alterações posteriores do cadastro.
- Contrato só encerra quando todos os itens estiverem finalizados ou cancelados.

## Decisões das telas

| Área | Decisão |
|---|---|
| Dashboard | Lista de trabalho real e resumo financeiro por período. |
| Nova locação | Separar orçamento, aprovação e contrato; remover valores implícitos. |
| Contratos | Itens independentes, estados agregados e histórico permanente. |
| Expedições | Seleção parcial de itens/patrimônios e comprovante por movimento. |
| Devoluções | Retorno parcial, comprovante, fotos e inspeção. |
| Produtos | Dados reais, marca/modelo/categoria e sem caução. |
| Disponibilidade/calendário | Somente reservas e movimentos reais. |
| Manutenções | Fluxo completo, custo, anexos e conclusão auditável. |
| Visão geral | Dados reais com filtro por período. |
| Fluxo de caixa | Entradas, saídas, baixa, conta e estorno. |
| Cobranças | Título, itens e pagamentos parciais. |
| Contas a pagar | Obrigação separada da saída financeira. |
| Cauções | Removidas do menu, formulários, totais e novos fluxos. |

## Ordem de implementação

1. Contas, cobranças, recebimentos, lançamentos e estornos.
2. `contrato_item`, vínculo com patrimônios e movimentos parciais.
3. Orçamento, pedido e contrato versionados e congelados.
4. Normalização de clientes e produtos sem quebrar registros existentes.
5. Dashboard e nomenclatura do menu.
6. Autenticação de backend e auditoria transversal.

Cada etapa inclui migração compatível, API, tela funcional e teste do fluxo principal.
