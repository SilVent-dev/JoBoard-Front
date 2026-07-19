# Joboard — Frontend

> Interface web do **Joboard**, um ATS pessoal (*Applicant Tracking System*) para quem está em busca ativa de emprego.

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-state-FFD859?style=flat&logo=vue.js&logoColor=black)
![Deploy](https://img.shields.io/badge/deploy-Render-46E3B7?style=flat&logo=render&logoColor=white)

**▶️ Em produção:** [joboard-front.onrender.com](https://joboard-front.onrender.com)
&nbsp;·&nbsp; Backend (Spring Boot): [SilVent-dev/JoBoard](https://github.com/SilVent-dev/JoBoard)

SPA em Vue 3 + Vite, com autenticação JWT, estado via Pinia e um design system próprio (**"Marco"** — paleta musgo/argila/celadon, tipografia Source Serif 4 + Inter). Cada usuário vê apenas os próprios dados — ownership garantido pelo backend em toda operação.

---

## Funcionalidades

- **Autenticação** — cadastro, verificação de email (tela dedicada `/verificar-email`), login, e fluxo de "esqueci minha senha" (`/redefinir-senha`)
- **Dashboard** — cards de métricas, chip de meta semanal, follow-ups pendentes, andamento recente e pipeline por etapa
- **Candidaturas** — visão em **lista** ou **painel (kanban)**, trilha de etapas guiada, histórico de eventos, notas e contatos por processo
- **Empresas** e **Vagas** — catálogos em grid de cards, com busca, filtros e CRUD completo
- **Currículos** — upload de PDF (até 5 MB) com barra de progresso, versionamento e marcação de principal
- **Perfil** — dados profissionais, pretensão salarial e preferências de modelo de trabalho, com validação inline
- **Insights** — funil de conversão, tempo médio por etapa e taxa de resposta
- **LGPD** — exportação de todos os dados (ZIP de CSVs) e exclusão de conta pelo próprio titular
- **Experiência** — transições suaves, skeletons de carregamento, toasts de feedback, estados vazios convidativos, foco acessível (`:focus-visible`) e respeito a `prefers-reduced-motion`

## Stack

| Tecnologia | Uso |
|---|---|
| Vue 3 | Framework principal (Composition API, `<script setup>`) |
| Vite 8 | Build tool e dev server |
| Vue Router | Navegação com guard de autenticação |
| Pinia | Estado global — token JWT, usuário e toasts |
| Axios | Cliente HTTP com interceptor de JWT |
| Lucide | Ícones |
| Sentry | Monitoramento de erros (opcional, ativa com `VITE_SENTRY_DSN`) |

## Estrutura

```
src/
├── api/                → uma função de chamada HTTP por contexto
│   ├── axios.js        → instância Axios (baseURL via VITE_API_URL) + interceptor de JWT
│   ├── auth.js  candidaturas.js  empresas.js  vagas.js
│   ├── curriculos.js  perfil.js  conta.js  insights.js
├── stores/
│   ├── auth.js         → token JWT, usuário logado, login/logout
│   └── toast.js        → notificações efêmeras
├── router/index.js     → rotas + guard de autenticação
├── views/              → telas completas
├── components/
│   ├── layout/AppLayout.vue → rail de navegação + topbar
│   └── ToastHost.vue
├── constants/status.js → rótulos e cores dos status do pipeline
└── assets/main.css     → tokens (cores, tipografia, espaçamento) + reset global
```

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Backend do Joboard rodando em `http://localhost:8080`

### Passos
```bash
git clone https://github.com/SilVent-dev/JoBoard-Front.git
cd JoBoard-Front
npm install
npm run dev
```
A interface sobe em `http://localhost:5173`. Em dev não é preciso variável de ambiente: o proxy do Vite redireciona `/auth` e `/api` para `http://localhost:8080`.

## Deploy (produção)

Publicado como **static site no Render** a partir deste repositório:

| Configuração | Valor |
|---|---|
| Root Directory | *(vazio — o app está na raiz do repo)* |
| Build Command | `npm install; npm run build` |
| Publish Directory | `dist` |
| Variável de build | `VITE_API_URL` = URL pública do backend |
| Regra de SPA | Rewrite `/*` → `/index.html` (rotas diretas como `/verificar-email`) |

`VITE_API_URL` é lida em **build time**: aponta o Axios para o backend publicado (em dev fica vazia e usa o proxy).

## Fluxo de autenticação

```
1. Cadastro em /cadastro → conta criada (pendente)
2. Email de verificação → link abre /verificar-email → conta ativa
3. Login em /login → backend devolve o JWT
4. Pinia guarda o token no localStorage
5. Axios injeta Authorization: Bearer <token> em cada requisição
6. 401/403 (fora de /auth) → limpa o token e volta para /login
7. Vue Router bloqueia rotas protegidas sem token
```

## Autores

**Leticia Batista Silva** — Engenheira Elétrica · Desenvolvedora Backend · MBA em Engenharia de Software (USP)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/leticia-batista-silva)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/leticiabsilva03)

**Pedro Ventura Oliveira** — Desenvolvedor Fullstack · Especialização em Engenharia de Software (PUC Minas)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/pedro-ventura-623426124)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/pdroVentu)
