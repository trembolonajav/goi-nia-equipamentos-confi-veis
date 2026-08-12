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
- Cada `contrato_item` representa uma linha comercial contratada, com quantidade, período, descrição e valores congelados.
- `contrato_item_patrimonio` vincula as unidades físicas que cumprem essa linha comercial; o patrimônio não fica embutido no item.
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

## Marco 5 — segurança essencial

- A API operacional exige sessão HTTP autenticada; a sessão do navegador fica em cookie HttpOnly.
- Requisições mutáveis exigem token CSRF no padrão `XSRF-TOKEN` / `X-XSRF-TOKEN`.
- Senhas são hashes unidirecionais produzidos por `PasswordEncoder` e nunca são retornadas pela API.
- O primeiro ADMIN nasce exclusivamente das variáveis `LOCAGO_ADMIN_LOGIN`, `LOCAGO_ADMIN_PASSWORD` e `LOCAGO_ADMIN_NAME` em banco sem usuários.
- Os papéis atuais são somente `ADMIN` e `OPERADOR`.
- OPERADOR executa atendimento, locação, equipamentos, manutenção e recebimentos. Administração de usuários, estornos, lançamentos administrativos, contas a pagar e configurações mutáveis exigem ADMIN no backend.
- Toda mutação autenticada gera `auditoria_evento` com usuário, papel, rota, método, status, data e IP.
- Esconder ações na interface é conveniência; autorização é sempre aplicada pela API.

## Marco 2 — normalização comercial

```text
ORCAMENTO
  -> ORCAMENTO_VERSAO
      -> ORCAMENTO_ITEM / ORCAMENTO_SERVICO
          -> PEDIDO_ITEM / PEDIDO_SERVICO
              -> CONTRATO_ITEM / CONTRATO_SERVICO
                  -> CONTRATO_ITEM_PATRIMONIO
```

- A versão é identificada pelo seu `id`; posição em array nunca é identidade comercial.
- Uma versão enviada é imutável. Qualquer renegociação cria uma nova versão e preserva a anterior.
- Somente uma versão com estado `ENVIADA` pode ser aprovada.
- A aprovação é idempotente por `orcamento_versao_id` e executada em uma única transação.
- Novos pedidos e contratos somente podem ser criados a partir da aprovação de uma versão persistida; os caminhos legados de gravação direta permanecem fechados.
- O backend carrega produtos, serviços, preços e snapshots persistidos; o frontend envia somente os identificadores e quantidades selecionados.
- Antes de materializar o pedido, o backend valida itens e disponibilidade. Qualquer falha desfaz pedido, contrato, reservas e cobrança.
- `pedido_item` referencia o item exato da versão aprovada; `contrato_item` referencia o item exato do pedido.
- A mesma cadeia existe para serviços em `pedido_servico` e `contrato_servico`.
- Descrição, marca, modelo, natureza e valores são snapshots históricos e não acompanham alterações futuras dos cadastros.
- Telas e documentos históricos leem exclusivamente os snapshots persistidos e nunca recalculam preços pelo cadastro atual do produto ou serviço.
- Os componentes comerciais são armazenados separadamente e obedecem à equação `valor_total = valor_locacao + valor_servicos + frete - desconto`.
- Os JSONs antigos permanecem apenas como projeção de compatibilidade para telas e registros anteriores; não são a fonte comercial dos novos fluxos.
