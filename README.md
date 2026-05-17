# Joboard — Frontend

> Interface web do sistema pessoal de rastreamento de candidaturas a vagas de emprego.

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=flat&logo=javascript&logoColor=black)

SPA construída com Vue 3 e Vite, com autenticação JWT, gerenciamento de estado via Pinia e design system próprio. O backend em Spring Boot está em [repositório separado](https://github.com/SilVent-dev/JoBoard).

---

## Sobre o projeto

O Joboard transforma o caos de acompanhar dezenas de candidaturas simultâneas em um processo estruturado e visual. A interface permite cadastrar empresas e vagas de interesse, acompanhar cada processo seletivo por etapas, visualizar um pipeline de candidaturas em formato kanban ou lista, registrar contatos feitos durante os processos e gerenciar múltiplas versões de currículo.

Cada usuário acessa apenas os próprios dados, pois a autenticação JWT e o controle de ownership são aplicados em toda operação via backend.

---

## Stack

| Tecnologia | Uso |
|---|---|
| Vue 3 | Framework principal — Composition API |
| Vite 8 | Build tool e dev server |
| Vue Router 4 | Navegação com guard de autenticação |
| Pinia | Estado global — token JWT e dados do usuário |
| Axios | Cliente HTTP com interceptor de JWT |
| Lucide Vue | Biblioteca de ícones |

---

## Funcionalidades

- **Autenticação completa** — cadastro, verificação de email, login e logout
- **Dashboard** — cards de métricas, candidaturas recentes e pipeline visual
- **Candidaturas** — view em lista ou kanban, avançar status, histórico de eventos, notas e contatos por processo
- **Empresas** — catálogo pessoal com busca e CRUD completo
- **Vagas** — lista com filtros por modelo, contrato, nível e status
- **Currículos** — upload de PDF com versionamento e marcação de principal
- **Perfil** — dados profissionais, pretensão salarial e preferências de trabalho

---

## Estrutura do projeto

```
src/
├── api/                → funções de chamada HTTP por contexto
│   ├── axios.js        → instância Axios com interceptor de JWT
│   ├── auth.js
│   ├── candidaturas.js
│   ├── empresas.js
│   ├── vagas.js
│   └── curriculos.js
├── stores/
│   └── auth.js         → token JWT, usuário logado, login/logout
├── router/
│   └── index.js        → rotas com guard de autenticação
├── views/              → telas completas
├── components/
│   └── layout/
│       └── AppLayout.vue → sidebar + topbar
└── assets/
    └── main.css        → CSS variables e reset global
```

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Backend do Joboard rodando em `http://localhost:8080`

### Instalação

```bash
git clone https://github.com/SilVent-dev/JoBoard-Front.git
cd JoBoard-Front
npm install
```

### Configuração

O projeto usa um proxy do Vite para comunicação com o backend — nenhuma variável de ambiente é necessária para rodar localmente. O arquivo `vite.config.js` já está configurado para redirecionar `/auth` e `/api` para `http://localhost:8080`.

### Rodando

```bash
npm run dev
```

A interface estará disponível em `http://localhost:5173`.

---

## Fluxo de autenticação

```
1. Usuário acessa /cadastro → cria conta
2. Verifica email pelo link recebido
3. Faz login em /login → recebe JWT
4. Pinia armazena o token no localStorage
5. Axios injeta Authorization: Bearer <token> em toda requisição
6. Se o backend retornar 403 → Pinia limpa o token e redireciona para /login
7. Vue Router bloqueia rotas protegidas sem token ativo
```

---

## Conexão com o backend

| Contexto | Rotas consumidas |
|---|---|
| Autenticação | `POST /auth/login`, `POST /auth/cadastro` |
| Perfil | `GET /api/perfil`, `PUT /api/perfil` |
| Currículos | `GET/POST/PATCH/DELETE /api/curriculos` |
| Empresas | `GET/POST/PUT/DELETE /api/empresas` |
| Vagas | `GET/POST/PUT/PATCH/DELETE /api/vagas` |
| Candidaturas | `GET/POST/PATCH /api/candidaturas` |
| Histórico | `GET /api/candidaturas/{id}/historico` |
| Contatos | `GET/POST/DELETE /api/candidaturas/{id}/contatos` |

---

## Autores

**Leticia Batista Silva**
Engenheira Elétrica · Desenvolvedora Backend
MBA em Engenharia de Software — USP

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/leticia-batista-silva)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/leticiabsilva03)

**Pedro Ventura Oliveira**
Desenvolvedor Fullstack
Especialização em Engenharia de Software — PUC Minas

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/pedro-ventura-623426124)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/pdroVentu)
