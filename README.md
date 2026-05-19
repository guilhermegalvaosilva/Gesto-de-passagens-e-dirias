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

O backend conecta ao Firebase Firestore usando `js/firebase-config.js` ou
variaveis de ambiente:

```text
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_AUTH_DOMAIN
FIREBASE_APP_ID
```

Colecoes usadas:

```text
solicitacoes_passagens_diarias
alteracoes_solicitacoes
admins
sessions
```

Em producao, o `render.yaml` usa:

```text
FIREBASE_LOCAL_FALLBACK=false
```

Assim o deploy so fica ativo quando o Firebase estiver acessivel.

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
