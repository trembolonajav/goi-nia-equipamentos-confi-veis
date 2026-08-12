# Projeto LOCAGO

Plataforma de locação de equipamentos composta pelo site público da LOCAGO e por um sistema interno para atendimento, estoque, contratos, logística, manutenção e financeiro.

## Funcionalidades

- Catálogo público com fichas técnicas, preços por período e atendimento via WhatsApp.
- Clientes PF/PJ, obras, documentos e histórico cadastral.
- Orçamentos versionados, aprovação e geração transacional de contratos.
- Produtos, categorias e patrimônios físicos identificados individualmente.
- Disponibilidade por período e tabela de diária, 3 dias, semana, quinzena e mês.
- Expedição, entrega, devolução e inspeção parcial por patrimônio.
- Manutenções corretivas, preventivas, limpeza e revisão.
- Cobranças, recebimentos, contas a pagar, caixa e estornos auditáveis.
- Dashboard operacional alimentado exclusivamente pela API.
- Autenticação por sessão HTTP, CSRF, papéis `ADMIN` e `OPERADOR` e auditoria.
- Templates de orçamento, contrato, entrega e devolução para impressão/PDF.

## Tecnologias

- Frontend: React 19, TypeScript e Vite.
- Backend: Java 17, Spring Boot 3, Spring Security e JDBC.
- Banco: PostgreSQL 17 e Flyway.
- Ambiente local: Docker Compose.

## Arquitetura de pastas

```text
projeto-locago/
├── backend/                       API Spring Boot
│   ├── src/main/java/             domínio, serviços, segurança e controllers
│   ├── src/main/resources/        configuração e migrations Flyway
│   └── src/test/                  testes automatizados
├── docs/                          decisões e especificação do LOCAGO Core
├── public/equipamentos/           imagens públicas do catálogo
├── src/                           aplicação React
│   ├── auth/                      sessão e tela de acesso
│   ├── components/                layout e componentes compartilhados
│   ├── data/                      store e tipos de compatibilidade
│   ├── lib/                       API, cálculo de preços e utilitários
│   ├── pages/                     sistema operacional interno
│   └── site/                      site e catálogo públicos
├── compose.yml                    PostgreSQL e backend local
└── package.json                   scripts e dependências do frontend
```

O PostgreSQL é a fonte de verdade. Dados operacionais não possuem fallback fictício quando a API está indisponível.

## Executar localmente

Pré-requisitos: Docker Desktop, Node.js e npm.

```bash
npm install
docker compose up -d --build
npm run dev
```

Serviços:

- Aplicação: `http://localhost:5173`
- API: `http://localhost:8081/api`
- Saúde: `http://localhost:8081/actuator/health`
- PostgreSQL: `localhost:5433`

## Primeiro administrador

O administrador inicial só é criado em um banco sem usuários. Informe as credenciais por variáveis de ambiente; nenhuma senha padrão é versionada.

PowerShell:

```powershell
$env:LOCAGO_ADMIN_LOGIN="admin"
$env:LOCAGO_ADMIN_PASSWORD="uma-senha-forte"
$env:LOCAGO_ADMIN_NAME="Administrador LOCAGO"
docker compose up -d --build
```

Depois da criação, remova as credenciais do ambiente.

## Validação

```bash
npm run build
cd backend
mvn test
```

## Regras importantes

- Não edite migrations já publicadas; crie uma nova versão.
- `contrato_item` representa a linha comercial.
- `contrato_item_patrimonio` vincula as unidades físicas utilizadas.
- Movimentações operacionais são parciais, transacionais e auditáveis.
- Recebimentos e pagamentos alteram o caixa apenas por lançamentos vinculados.
- Estornos preservam o evento original e criam uma reversão.
- O Core não utiliza caução.

## Documentação

A especificação funcional e o roadmap estão em [`docs/LOCAGO_CORE.md`](docs/LOCAGO_CORE.md).

## Estado

**LOCAGO Core V1 operacional**

- Foundation V1: concluída.
- Marco 2 — Comercial: concluído.
- Marco 3/3.1 — Cadastros operacionais: concluído.
- Marco 4 — Experiência operacional: concluído.
- Marco 5 — Segurança essencial: concluído.

## Licença

Projeto privado da LOCAGO. Uso e distribuição dependem de autorização do proprietário.
