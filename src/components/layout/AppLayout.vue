<template>
  <div class="app-layout">

    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-mark">
          <Briefcase :size="14" />
        </div>
        <div class="logo-text">
          <span class="logo-name">Joboard</span>
          <span class="logo-sub">Career Atelier</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" :size="16" class="nav-icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <RouterLink to="/perfil" class="nav-item" :class="{ active: isActive('/perfil') }">
          <Settings :size="16" class="nav-icon" />
          <span>Perfil</span>
        </RouterLink>
        <button class="nav-item logout-btn" @click="handleLogout">
          <LogOut :size="16" class="nav-icon" />
          <span>Sair</span>
        </button>

        <div class="user-chip">
          <div class="user-avatar">{{ iniciais }}</div>
          <div class="user-info">
            <span class="user-name">{{ nomeExibido }}</span>
            <span class="user-email">{{ auth.usuario?.email || '' }}</span>
          </div>
        </div>
      </div>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <div>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-sub">{{ pageSubs[pageTitle] || '' }}</p>
        </div>
        <div class="topbar-actions">
          <slot name="topbar-actions" />
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Briefcase, LayoutDashboard, ClipboardList,
  Building2, Search, FileText, Settings, LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/candidaturas', label: 'Applications', icon: ClipboardList },
  { to: '/empresas',     label: 'Companies',    icon: Building2 },
  { to: '/vagas',        label: 'Jobs',         icon: Search },
  { to: '/curriculos',   label: 'Resumes',      icon: FileText },
]

const pageTitles = {
  '/':             'Dashboard',
  '/candidaturas': 'Applications',
  '/empresas':     'Companies',
  '/vagas':        'Jobs',
  '/curriculos':   'Resumes',
  '/perfil':       'User Profile',
}

const pageSubs = {
  'Dashboard':    'Your career overview at a glance.',
  'Applications': 'Track every step of your job search.',
  'Companies':    'Manage your company catalogue.',
  'Jobs':         'Browse and filter saved opportunities.',
  'Resumes':      'Manage your CV versions.',
  'User Profile': 'Manage your professional identity and preferences.',
}

const pageTitle = computed(() => {
  const base = '/' + route.path.split('/')[1]
  return pageTitles[route.path] || pageTitles[base] || 'Joboard'
})

const iniciais = computed(() => {
  const nome = auth.usuario?.nome || ''
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'C'
})

const nomeExibido = computed(() => auth.usuario?.nome || 'Candidato')

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
  background: #F5F0EB;
  font-family: var(--font-ui);
}

/* Sidebar */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  margin-bottom: 12px;
}

.logo-mark {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: #D94518;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(217,69,24,0.3);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1208;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.logo-sub {
  font-size: 10px;
  color: #b8a898;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: #6a5a4a;
  text-decoration: none;
  transition: background 0.1s, color 0.1s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: rgba(0,0,0,0.04);
  color: #1a1208;
}

.nav-item.active {
  background: #fff;
  color: #1a1208;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
}

.nav-icon { flex-shrink: 0; }

.nav-item.active .nav-icon { color: #D94518; }

/* Bottom */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.logout-btn { color: #6a5a4a; }
.logout-btn:hover { color: #c0392b; background: rgba(192,57,43,0.06); }

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  margin-top: 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.9);
}

.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(217,69,24,0.12);
  color: #D94518;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 12px; font-weight: 600;
  color: #1a1208;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.user-email {
  font-size: 10.5px; color: #b8a898;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Main */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  margin: 12px 12px 12px 0;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.topbar {
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f0ebe4;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1208;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.page-sub {
  font-size: 13px;
  color: #9a8878;
  margin-top: 3px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}
</style>