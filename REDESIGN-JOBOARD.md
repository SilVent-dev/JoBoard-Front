# Marco (redesign do JoBoard) — Guia de aplicação no front end

Não tenho acesso de escrita ao seu repositório local (`joboard-frontend`) — só leio o que você anexa. Este documento traz tudo que você (ou o Claude Code) precisa para aplicar o redesign no projeto Vue real. As telas de referência completas e interativas estão em `Login.dc.html`, `Cadastro.dc.html`, `Dashboard.dc.html`, `Candidaturas.dc.html` e `Vagas.dc.html` neste projeto — abra-as no navegador para ver cor, espaçamento e estado exatos de cada elemento.

## 1. Direção visual final

- **Nome de marca:** Marco — "um waypoint na sua jornada de carreira". Substitui "Joboard" em toda a UI (título, marca-d'água do logo, título da aba do navegador).
- **Marca:** quadrado arredondado musgo (`--moss`) com um pequeno losango argila (`--clay`) centralizado — sem ícone de terceiros.
- **Fundo:** papel claro puxado para o verde do musgo (celadon), não bege — dá coesão à paleta e foge do clichê "SaaS bege".
- **Navegação:** rail de ícones fino (76px) em vez de sidebar preenchida pesada — cada item é uma forma geométrica simples + legenda de 3-8 letras abaixo, sem caixas de fundo. Libera espaço horizontal e é bem menos "painel administrativo".
- **Tipografia:** títulos em serifa (`Source Serif 4`), UI em `Inter`.
- **Tom de voz:** mais humano e calmo — "Que bom te ver de novo" em vez de "Bem-vinda de volta", "Bom dia, Ana" em vez de "Dashboard", etc. (ver seção 6).

## 2. Tokens — substituir em `src/assets/main.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap');

:root {
  --bg: #F1F3EC;              /* celadon — não usar bege/creme */
  --surface: #FFFFFF;
  --surface-alt: #E7EBDF;
  --rail-border: #DCE2D3;
  --border: #DCE2D3;
  --border-subtle: #E7EBDF;

  --text-primary: #20241E;
  --text-secondary: #54594B;
  --text-muted: #82887A;
  --text-inverse: #F1F3EC;

  --moss: #3F5D4E;             /* cor de marca — estrutura, confiança */
  --moss-hover: #35503F;
  --moss-subtle: rgba(63,93,78,0.12);

  --clay: #C1652E;             /* acento pontual — destaques, CTAs secundários */
  --clay-hover: #A8531F;
  --clay-subtle: rgba(193,101,46,0.14);

  --success: #5B8C6B;   --success-subtle: rgba(91,140,107,0.14);
  --warning: #C79A3B;   --warning-subtle: rgba(199,154,59,0.14);
  --danger:  #B8564A;   --danger-subtle:  rgba(184,86,74,0.14);
  --info:    #5C7FA6;   --info-subtle:    rgba(92,127,166,0.14);
  --purple:  #8B7BB0;   --purple-subtle:  rgba(139,123,176,0.14);
  --teal:    #4E8C8C;   --teal-subtle:    rgba(78,140,140,0.14);

  --font-display: 'Source Serif 4', Georgia, serif;
  --font-ui: 'Inter', system-ui, sans-serif;

  /* mantenha --sp-*, --radius-*, --shadow-* como já estão */
}
```

Remova o bloco `[data-theme="dark"]` — o produto passa a ser single-theme claro. `h1/.h1`, `.page-title` etc. devem usar `font-family: var(--font-display)`.

## 3. `AppLayout.vue` — trocar a sidebar por um rail fino

Referência completa: o `<aside>` de qualquer `.dc.html` (Dashboard/Candidaturas/Vagas — é idêntico nos três).

- Largura: `220px` → **`76px`**.
- Fundo: remove `--sidebar-bg` preenchido → `background: transparent`, só `border-right: 1px solid var(--rail-border)`.
- Cada item de navegação vira uma coluna centralizada: forma geométrica simples (18-20px) + legenda de 3-8 letras em maiúsculas (9px, `letter-spacing:0.03em`), sem texto longo, sem fundo de hover preenchido — só muda a cor (musgo quando ativo, `--text-muted` quando inativo).
  - Dashboard → quadrado com borda (ativo: preenchido musgo + glifo branco dentro)
  - Candidaturas → círculo
  - Vagas → losango (quadrado rotacionado 45°)
  - Empresas → triângulo (`border-left/right/bottom` em CSS)
  - Currículos → três barrinhas horizontais decrescentes (like linhas de texto)
- Rodapé do rail: avatar circular com iniciais + dois links de texto pequenos ("Perfil", "Sair"), sem chip de usuário grande.
- `.main-area`: remove o "cartão dentro do cartão" (não precisa mais de `margin` + `border-radius` envolvendo tudo) — o conteúdo agora ocupa o espaço direto sobre `--bg`, com respiro de `40px` de padding.
- `.topbar`/`.page-title`: heading em `var(--font-display)`, 26px.

## 4. Telas de autenticação — `LoginView.vue` / `CadastroView.vue`

Painel esquerdo: fundo sólido `var(--moss)` (não mais laranja/blobs), um glow radial sutil em `--clay` no canto superior direito, tagline em `var(--font-display)` 32px. Ver textos exatos na seção 6.

Card de formulário: fundo `var(--surface)` sólido, `border: 1px solid var(--border)`, `border-radius: 20px`, sombra suave `0 24px 56px rgba(32,36,30,0.08)` — sem efeito glass/blur.

Botões OAuth: monogramas simples (`G`, `in`, `gh`) em vez de logos de marca.

## 5. `DashboardView.vue` — estrutura de cards atualizada

Trocar a grade de 4 métricas iguais por **3 cards assimétricos**:
1. "Candidaturas ativas" — card branco neutro, número grande.
2. "Em entrevista" — card preenchido `var(--moss)`, texto claro.
3. **Novo card "Próxima ação"** — preenchido `var(--clay)`, mostra a próxima ação mais próxima entre todas as candidaturas (usa os campos `proximaAcaoDescricao` + `proximaAcaoEm` que já existem no back-end, em `Candidatura`). Ex: "Entrevista técnica" / "Nimbus Cloud · amanhã, 14h".

No cabeçalho, ao lado da saudação, um **chip de meta semanal**: anel de progresso pequeno + "3 de 5 candidaturas essa semana" (contagem de candidaturas com `criadoEm` nos últimos 7 dias vs. uma meta configurável — pode começar fixa em 5 e depois virar preferência no Perfil).

Seções abaixo mantêm os dados atuais (`candidaturasRecentes`, `pipeline`), só trocam de "Candidaturas recentes"/"Pipeline" para os rótulos "Andamento recente"/"Por etapa" e a paleta de cores por status (ver `STATUS` no script de `Dashboard.dc.html` — inclui `--purple` e `--teal` para as etapas comportamental/teste).

## 6. `CandidaturasView.vue`

Mesma estrutura (lista/kanban, modal de detalhe com histórico/notas/contato) — mudanças:
- Toggle lista/kanban renomeado para **"Lista" / "Painel"**.
- Cada linha da lista, quando a candidatura tem `proximaAcaoDescricao` preenchido, mostra um texto curto em `--clay` antes do status (ex: "amanhã, 14h") — reforça o mesmo dado usado no card do dashboard.
- Textareas de nota com placeholder mais humano: "O que vale lembrar sobre essa conversa...".
- Cores de status seguem a tabela em `Candidaturas.dc.html`.

## 7. `VagasView.vue`

- Barra de busca ganha um contador discreto "`N` salvas" ao lado dos filtros.
- Botão principal renomeado de "Nova vaga" para **"Adicionar vaga"**.
- Tag "Fechada" → **"Encerrada"**.
- Cores das tags de modelo de trabalho usam `--success/--info/--warning`; faixa salarial usa `--clay-subtle`.

## 8. Frases/copy atualizadas (usar literalmente)

| Onde | Antes | Depois |
|---|---|---|
| Login título | Bem-vinda de volta | **Que bom te ver de novo** |
| Login subtítulo | Entre na sua conta para continuar | **Continue de onde parou na sua busca** |
| Login painel tagline | Sua jornada de carreira, organizada. | **Cada etapa da sua busca, no lugar certo.** |
| Login painel sub | Rastreie cada candidatura, cada entrevista, cada passo. | **Sem planilha perdida, sem aba esquecida. Só o essencial.** |
| Cadastro título | Criar conta | **Criar conta** (mantido) |
| Cadastro subtítulo | Preencha os dados para começar | **Dois minutos e você já começa a rastrear** |
| Cadastro painel tagline | Comece sua jornada agora. | **Sua próxima vaga começa aqui.** |
| Cadastro painel sub | Crie sua conta e tenha controle de cada processo. | **Organize sua busca com clareza — e sem pressa.** |
| Cadastro sucesso | Conta criada! / Verifique seu email... 2 horas. | **Conta criada** / **Enviamos um link de confirmação — ele vale por 2 horas.** |
| Dashboard título | Dashboard | **Bom dia, {nome}** |
| Dashboard subtítulo | Aqui está um resumo da sua busca de emprego. | **Aqui está como sua semana está indo.** |
| Candidaturas subtítulo | Track every step of your job search. | **Cada etapa do processo, sem perder o fio.** |
| Vagas subtítulo | Browse and filter saved opportunities. | **As oportunidades que valem seu tempo, num só lugar.** |

## 9. Telas ainda não desenhadas

`EmpresasView.vue`, `CurriculosView.vue`, `PerfilView.vue` seguem "em construção". Quando quiser, sigo com elas nesse mesmo estilo (rail fino, cores musgo/argila, cards com o mesmo tom de voz).

## 10. Como aplicar

Se tiver o "Handoff to Claude Code" disponível neste projeto, é o caminho mais direto: empacota os 5 arquivos `.dc.html` de referência com notas de implementação para aplicar direto no repositório Vue. Para aplicar manualmente, siga as seções acima arquivo por arquivo — todo valor de cor/espaçamento exato está nos `.dc.html`, use-os como fonte da verdade visual.
