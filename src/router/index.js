import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

function prefereMenosMovimento() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('@/views/CadastroView.vue')
    },
    {
      path: '/esqueci-senha',
      name: 'esqueci-senha',
      component: () => import('@/views/EsqueciSenhaView.vue')
    },
    {
      path: '/redefinir-senha',
      name: 'redefinir-senha',
      component: () => import('@/views/RedefinirSenhaView.vue')
    },
    {
      path: '/verificar-email',
      name: 'verificar-email',
      component: () => import('@/views/VerificarEmailView.vue')
    },
    {
      path: '/',
      meta: { requerAuth: true },
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'candidaturas',
          name: 'candidaturas',
          component: () => import('@/views/CandidaturasView.vue')
        },
        {
          path: 'empresas',
          name: 'empresas',
          component: () => import('@/views/EmpresasView.vue')
        },
        {
          path: 'vagas',
          name: 'vagas',
          component: () => import('@/views/VagasView.vue')
        },
        {
          path: 'curriculos',
          name: 'curriculos',
          component: () => import('@/views/CurriculosView.vue')
        },
        {
          path: 'insights',
          name: 'insights',
          component: () => import('@/views/InsightsView.vue')
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('@/views/PerfilView.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requerAuth && !auth.estaLogado) {
    return { name: 'login' }
  }
  if ((to.name === 'login' || to.name === 'cadastro') && auth.estaLogado) {
    return { name: 'dashboard' }
  }
})

// Transição nativa de rota (View Transitions API) — progressive enhancement.
// Onde não houver suporte (ex.: Firefox), cai no <Transition> CSS do AppLayout.
// Respeita prefers-reduced-motion e ignora a primeira carga.
router.beforeResolve((to, from, next) => {
  const primeiraCarga = from.matched.length === 0
  if (
    typeof document === 'undefined' ||
    !document.startViewTransition ||
    primeiraCarga ||
    to.path === from.path ||
    prefereMenosMovimento()
  ) {
    next()
    return
  }
  document.startViewTransition(() => {
    next()
    return nextTick()
  })
})

export default router