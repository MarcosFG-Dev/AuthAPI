API de autenticação para produtos B2B, com foco em segurança corporativa, escalabilidade e operação em produção.

## Destaques de produto

- Arquitetura limpa em camadas: `domain`, `application`, `infrastructure`, `interfaces`, `shared`
- JWT com **access token curto** e **refresh token rotation**
- Mitigação de **refresh token reuse attack** (revogação de família)
- Refresh token em cookie **HTTP-only**
- Observabilidade com logs estruturados (`pino`) e `x-request-id`
- API versionada (`/api/v1`) com respostas padronizadas
- OpenAPI/Swagger em `/docs`
- Prisma + PostgreSQL com migrations e índices
- Docker + CI com gate de cobertura

## Stack

- Node.js 18+
- Express
- Prisma ORM + PostgreSQL
- Zod (validação)
- Pino (logs)
- Jest + Supertest (testes)

## Estrutura

```text
src/
  domain/
  application/
  infrastructure/
  interfaces/http/
  shared/
  app.js
  container.js
  server.js
prisma/
tests/
```

## Segurança implementada

- Hash de senha com `bcrypt`
- Refresh token hash persistido (não salva token puro em banco)
- Rotation de refresh token por uso
- Bloqueio de brute force de login
- `helmet` + `cors` com allow-list + rate limiting
- Validação de payload com Zod

## Padrão de respostas

- Sucesso: `{ success, message, data, meta }`
- Erro: `{ success, error: { code, message, details } }`

## Endpoints principais

- `GET /health` (liveness)
- `GET /health/liveness`
- `GET /health/readiness` (readiness, valida banco)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /docs`

## Setup local (manual)

1. Instale dependências:
```bash
npm install
```
2. Copie ambiente:
```bash
copy .env.example .env
```
3. Suba PostgreSQL:
```bash
docker compose up -d postgres
```
4. Aplique migrations:
```bash
npm run prisma:deploy
```
5. Suba API:
```bash
npm run dev
```

## Comando único de demo

```bash
npm run demo:up
```

Esse comando sobe o PostgreSQL, aplica migration e inicia a API.

Para parar:

```bash
npm run demo:down
```

## Produção segura

- Use `.env.production.example` como referência
- Nunca commitar segredos
- Em produção, exija:
  - `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` fortes
  - `CORS_ORIGINS` explícito
  - `COOKIE_SECURE=true` com HTTPS
  - banco gerenciado (RDS/Neon/Railway/etc.)

## Docker

```bash
docker compose up --build
```

O `docker-compose.yml` está preparado para exigir segredos via env vars.

## CI e qualidade

Pipeline em `.github/workflows/ci.yml` com:

- `npm ci`
- `prisma generate`
- `npm run test:ci`

(checklist) Oque ja foi testado!

- [x] Arquitetura enterprise
- [x] Segurança base corporativa
- [x] Migrations e banco profissional
- [x] Health checks de liveness/readiness
- [x] Logging estruturado
- [x] Docker e documentação de deploy
- [x] CI com gate de qualidade
- [x] Testes automatizados com threshold

