# Gestao de passagens e diarias

Aplicacao React + Vite com backend Node.js. O backend entrega o frontend e a API
no mesmo link publico.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/guilhermegalvaosilva/Gesto-de-passagens-e-dirias)

## Rodar localmente

```bash
npm install
npm run build
npm start
```

Acesse:

```text
http://localhost:3002
```

Login inicial:

```text
admin / 123456
```

## Banco de dados

O backend conecta ao Supabase usando variaveis de ambiente no servidor:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Para rodar localmente, copie `.env.example` para `.env` e preencha os valores
do seu projeto.

Antes de iniciar, rode o SQL de `supabase.schema.sql` no SQL Editor do Supabase.
Tabelas usadas:

```text
solicitacoes
alteracoes
admins
sessions
```

Em producao, o `render.yaml` usa:

```text
SUPABASE_LOCAL_FALLBACK=false
```

Assim o deploy so fica ativo quando o Supabase estiver acessivel.

## Deploy pelo GitHub

1. Suba o projeto para o GitHub.
2. Abra o botao "Deploy to Render" acima.
3. Confirme a criacao do Web Service.
4. Aguarde o build terminar.

O Render gera um link unico com frontend e backend, por exemplo:

```text
https://gestao-passagens-diarias.onrender.com
```

Comandos usados pelo deploy:

```text
Build command: npm ci && npm run build
Start command: npm start
Health check: /api/health
```

## Desenvolvimento

Para editar o frontend com recarregamento automatico, rode dois terminais:

```bash
npm run dev:api
```

```bash
npm run dev
```

O Vite redireciona `/api` para `http://localhost:3002`.
