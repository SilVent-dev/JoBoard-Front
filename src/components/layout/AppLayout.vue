<template>
  <div class="app-layout">

    <aside class="rail">
      <div class="brand-mark" title="Marco">
        <div class="brand-diamond"></div>
      </div>

      <nav class="rail-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rail-item"
          :class="{ active: isActive(item.to) }"
        >
          <span class="shape" :class="item.shape">
            <span v-if="item.shape === 'shape-square'" class="shape-glyph"></span>
            <template v-if="item.shape === 'shape-bars'">
              <span class="bar"></span>
              <span class="bar bar-70"></span>
              <span class="bar bar-90"></span>
            </template>
          </span>
          <span class="rail-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="rail-footer">
        <div class="rail-avatar">{{ iniciais }}</div>
        <RouterLink to="/perfil" class="rail-link" :class="{ active: isActive('/perfil') }">Perfil</RouterLink>
        <button class="rail-link" @click="handleLogout">Sair</button>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-sub">{{ pageSub }}</p>
        </div>
        <div id="topbar-actions" class="topbar-actions">
          <slot name="topbar-actions" />
        </div>
      </header>

      <main class="content">
        <RouterView v-slot="{ Component }">
          <Transition name="rota" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { to: '/',             label: 'Início',   shape: 'shape-square' },
  { to: '/candidaturas', label: 'Etapas',   shape: 'shape-circle' },
  { to: '/vagas',        label: 'Vagas',    shape: 'shape-diamond' },
  { to: '/empresas',     label: 'Empresas', shape: 'shape-triangle' },
  { to: '/curriculos',   label: 'CVs',      shape: 'shape-bars' },
  { to: '/insights',     label: 'Insights', shape: 'shape-donut' },
]

const pageTitles = {
  '/':             'Dashboard',
  '/candidaturas': 'Candidaturas',
  '/empresas':     'Empresas',
  '/vagas':        'Vagas',
  '/curriculos':   'Currículos',
  '/insights':     'Insights',
  '/perfil':       'Perfil',
}

const pageSubs = {
  '/':             'Aqui está como sua semana está indo.',
  '/candidaturas': 'Cada etapa do processo, sem perder o fio.',
  '/empresas':     'Seu catálogo de empresas.',
  '/vagas':        'As oportunidades que valem seu tempo, num só lugar.',
  '/curriculos':   'Suas versões de currículo.',
  '/insights':     'O que o seu histórico já pode te contar.',
  '/perfil':       'Sua identidade profissional.',
}

const baseRoute = computed(() => {
  const base = '/' + route.path.split('/')[1]
  return pageTitles[route.path] ? route.path : base
})

const primeiroNome = computed(() => (auth.usuario?.nome || '').split(' ')[0])

const pageTitle = computed(() => {
  if (baseRoute.value === '/') {
    return primeiroNome.value ? `Bom dia, ${primeiroNome.value}` : 'Bom dia'
  }
  return pageTitles[baseRoute.value] || 'Marco'
})

const pageSub = computed(() => pageSubs[baseRoute.value] || '')

const iniciais = computed(() => {
  const nome = auth.usuario?.nome || ''
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'C'
})

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: var(--bg);
  /* Ruído sutil (~3%) sobre o celadon para a cor sólida não parecer chapada.
     SVG inline; pinta acima da cor de fundo e abaixo do conteúdo (cards têm
     fundo próprio e cobrem o grão). */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E");
  font-family: var(--font-ui);
}

/* ── Rail ────────────────────────────── */
.rail {
  width: 76px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: transparent;
  border-right: 1px solid var(--rail-border);
}

.brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--moss);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  flex-shrink: 0;
}

.brand-diamond {
  width: 11px;
  height: 11px;
  background: var(--clay);
  transform: rotate(45deg);
  border-radius: 3px;
}

/* Nav */
.rail-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}

.rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.rail-label {
  font-size: 8.5px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.rail-item.active .rail-label {
  font-weight: 700;
  color: var(--moss);
}

/* Micro-interações de hover no rail */
.rail-item:not(.active):hover .rail-label { color: var(--text-secondary); }
.rail-item:not(.active):hover .shape-square,
.rail-item:not(.active):hover .shape-circle,
.rail-item:not(.active):hover .shape-diamond,
.rail-item:not(.active):hover .shape-donut { border-color: var(--text-secondary); }
.rail-item:not(.active):hover .shape-triangle { border-bottom-color: var(--text-secondary); }
.rail-item:not(.active):hover .bar { background: var(--text-secondary); }

/* Formas geométricas */
.shape {
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-square {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid var(--text-muted);
}
.rail-item.active .shape-square {
  border: none;
  background: var(--moss);
}
.shape-glyph {
  display: none;
  width: 8px;
  height: 8px;
  background: var(--text-inverse);
  border-radius: 2px;
}
.rail-item.active .shape-glyph { display: block; }

.shape-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--text-muted);
}
.rail-item.active .shape-circle {
  border: none;
  background: var(--moss);
}

.shape-diamond {
  width: 14px;
  height: 14px;
  background: transparent;
  border: 2px solid var(--text-muted);
  transform: rotate(45deg);
  border-radius: 2px;
}
.rail-item.active .shape-diamond {
  border: none;
  background: var(--moss);
}

.shape-triangle {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid var(--text-muted);
}
.rail-item.active .shape-triangle {
  border-bottom-color: var(--moss);
}

.shape-donut {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 5px solid var(--text-muted);
}
.rail-item.active .shape-donut {
  border-color: var(--moss);
}

.shape-bars {
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  width: 16px;
}
.bar {
  height: 2px;
  background: var(--text-muted);
  border-radius: 1px;
}
.bar-70 { width: 70%; }
.bar-90 { width: 90%; }
.rail-item.active .bar { background: var(--moss); }

/* Rodapé do rail */
.rail-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--rail-border);
  width: 100%;
}

.rail-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--moss-subtle);
  color: var(--moss);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rail-link {
  font-size: 8.5px;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-family: var(--font-ui);
}

.rail-link:hover,
.rail-link.active {
  color: var(--moss);
}

/* ── Main area ──────────────────────── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  padding: 32px 40px 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-shrink: 0;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: var(--text-primary);
  text-wrap: balance;
}

.page-sub {
  font-size: 13.5px;
  color: var(--text-muted);
  margin-top: 6px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0 40px 40px;
}

/* Transição suave entre rotas */
.rota-enter-active,
.rota-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.rota-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.rota-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
