<template>
  <div class="dashboard">

    <!-- Saudação -->
    <div class="greeting">
      <h2 class="greeting-title">
        Bem-vinda de volta{{ nomeExibido ? ', ' + nomeExibido : '' }}. 👋
      </h2>
      <p class="greeting-sub">Aqui está um resumo da sua busca de emprego.</p>
    </div>

    <!-- Cards de métricas -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Candidaturas ativas</span>
          <div class="metric-icon" style="background: rgba(217,69,24,0.08); color: #D94518;">
            <Briefcase :size="16" />
          </div>
        </div>
        <p class="metric-value">{{ metricas.total }}</p>
        <p class="metric-sub">processos em andamento</p>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Em entrevista</span>
          <div class="metric-icon" style="background: rgba(37,99,235,0.08); color: #2563EB;">
            <Users :size="16" />
          </div>
        </div>
        <p class="metric-value">{{ metricas.entrevistas }}</p>
        <p class="metric-sub">entrevistas ativas</p>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Wishlist</span>
          <div class="metric-icon" style="background: rgba(217,119,6,0.08); color: #D97706;">
            <Star :size="16" />
          </div>
        </div>
        <p class="metric-value">{{ metricas.wishlist }}</p>
        <p class="metric-sub">vagas salvas</p>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-label">Propostas</span>
          <div class="metric-icon" style="background: rgba(5,150,105,0.08); color: #059669;">
            <TrendingUp :size="16" />
          </div>
        </div>
        <p class="metric-value">{{ metricas.propostas }}</p>
        <p class="metric-sub">ofertas recebidas</p>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="dashboard-body">

      <!-- Candidaturas recentes -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Candidaturas recentes</h3>
          <RouterLink to="/candidaturas" class="section-link">Ver todas →</RouterLink>
        </div>

        <div v-if="carregando" class="empty-state">
          <p>Carregando...</p>
        </div>

        <div v-else-if="candidaturasRecentes.length === 0" class="empty-state">
          <div class="empty-icon"><Inbox :size="28" /></div>
          <p class="empty-title">Nenhuma candidatura ainda</p>
          <p class="empty-sub">Cadastre uma empresa, uma vaga e comece a rastrear.</p>
          <RouterLink to="/empresas" class="btn-action">Começar agora</RouterLink>
        </div>

        <div v-else class="candidaturas-list">
          <div
            v-for="c in candidaturasRecentes"
            :key="c.id"
            class="candidatura-row"
          >
            <div class="candidatura-info">
              <p class="candidatura-vaga">{{ c.vagaTitulo }}</p>
              <p class="candidatura-empresa">{{ c.empresaNome }}</p>
            </div>
            <div class="candidatura-right">
              <span class="status-badge" :style="statusStyle(c.status)">
                {{ statusLabel(c.status) }}
              </span>
              <span class="candidatura-data">{{ formatarData(c.criadoEm) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline resumido -->
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Pipeline</h3>
        </div>
        <div class="pipeline">
          <div
            v-for="etapa in pipeline"
            :key="etapa.status"
            class="pipeline-item"
          >
            <div class="pipeline-count" :style="{ color: etapa.cor }">
              {{ etapa.total }}
            </div>
            <div class="pipeline-bar-wrap">
              <div
                class="pipeline-bar"
                :style="{
                  width: metricas.total > 0 ? (etapa.total / metricas.total * 100) + '%' : '0%',
                  background: etapa.cor
                }"
              ></div>
            </div>
            <div class="pipeline-label">{{ etapa.label }}</div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { listar } from '@/api/candidaturas'
import { Briefcase, Users, Star, TrendingUp, Inbox } from 'lucide-vue-next'


const auth = useAuthStore()
const candidaturas = ref([])
const carregando = ref(true)

const nomeExibido = computed(() => {
  const nome = auth.usuario?.nome || ''
  return nome.split(' ')[0]
})

const metricas = computed(() => {
  const ativas = candidaturas.value
  return {
    total:       ativas.length,
    wishlist:    ativas.filter(c => c.status === 'LISTA_DESEJO').length,
    entrevistas: ativas.filter(c => ['TRIAGEM_TELEFONICA','ENTREVISTA_TECNICA','ENTREVISTA_COMPORTAMENTAL'].includes(c.status)).length,
    propostas:   ativas.filter(c => c.status === 'PROPOSTA_RECEBIDA').length,
  }
})

const candidaturasRecentes = computed(() =>
  [...candidaturas.value]
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
    .slice(0, 5)
)

const pipeline = computed(() => [
  { status: 'LISTA_DESEJO',             label: 'Wishlist',     cor: '#9C8E84', total: candidaturas.value.filter(c => c.status === 'LISTA_DESEJO').length },
  { status: 'APLICADA',                 label: 'Aplicadas',    cor: '#2563EB', total: candidaturas.value.filter(c => c.status === 'APLICADA').length },
  { status: 'TRIAGEM_TELEFONICA',       label: 'Triagem',      cor: '#D97706', total: candidaturas.value.filter(c => c.status === 'TRIAGEM_TELEFONICA').length },
  { status: 'ENTREVISTA_TECNICA',       label: 'Técnica',      cor: '#C47C3E', total: candidaturas.value.filter(c => c.status === 'ENTREVISTA_TECNICA').length },
  { status: 'ENTREVISTA_COMPORTAMENTAL',label: 'Comportamental',cor: '#7C3AED',total: candidaturas.value.filter(c => c.status === 'ENTREVISTA_COMPORTAMENTAL').length },
  { status: 'TESTE_PRATICO',            label: 'Teste',        cor: '#0D9488', total: candidaturas.value.filter(c => c.status === 'TESTE_PRATICO').length },
  { status: 'PROPOSTA_RECEBIDA',        label: 'Proposta',     cor: '#059669', total: candidaturas.value.filter(c => c.status === 'PROPOSTA_RECEBIDA').length },
])

const statusMap = {
  LISTA_DESEJO:             { label: 'Wishlist',       cor: '#9C8E84', bg: '#f3f2f1' },
  APLICADA:                 { label: 'Aplicada',       cor: '#2563EB', bg: '#EFF6FF' },
  TRIAGEM_TELEFONICA:       { label: 'Triagem',        cor: '#D97706', bg: '#FFFBEB' },
  ENTREVISTA_TECNICA:       { label: 'Ent. Técnica',   cor: '#C47C3E', bg: '#FEF3C7' },
  ENTREVISTA_COMPORTAMENTAL:{ label: 'Ent. Comport.',  cor: '#7C3AED', bg: '#F5F3FF' },
  TESTE_PRATICO:            { label: 'Teste',          cor: '#0D9488', bg: '#F0FDFA' },
  PROPOSTA_RECEBIDA:        { label: 'Proposta',       cor: '#059669', bg: '#F0FDF4' },
  ACEITA:                   { label: 'Aceita',         cor: '#047857', bg: '#ECFDF5' },
  REJEITADA:                { label: 'Rejeitada',      cor: '#DC2626', bg: '#FEF2F2' },
  DESISTIDA:                { label: 'Desistida',      cor: '#6B7280', bg: '#F9FAFB' },
}

function statusLabel(status) {
  return statusMap[status]?.label || status
}

function statusStyle(status) {
  const s = statusMap[status] || { cor: '#6B7280', bg: '#F9FAFB' }
  return { color: s.cor, background: s.bg }
}

function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

onMounted(async () => {
  console.log('onMounted rodou')
  try {
    const { data } = await listar()
    candidaturas.value = data
  } catch  {
    candidaturas.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Saudação */
.greeting-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1208;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.greeting-sub {
  font-size: 13px;
  color: #9a8878;
}

/* Métricas */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  background: #FAF8F5;
  border: 1px solid #EDE8E0;
  border-radius: 14px;
  padding: 20px;
  transition: box-shadow 0.15s;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #9a8878;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1208;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-sub {
  font-size: 12px;
  color: #b8a898;
}

/* Body */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

/* Seções */
.section {
  background: #FAF8F5;
  border: 1px solid #EDE8E0;
  border-radius: 14px;
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1208;
  letter-spacing: -0.01em;
}

.section-link {
  font-size: 12px;
  color: #D94518;
  font-weight: 500;
  text-decoration: none;
}

.section-link:hover { text-decoration: underline; }

/* Estado vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 32px 16px;
  gap: 8px;
}

.empty-icon {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: #EDE8E0;
  color: #9a8878;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1208;
}

.empty-sub {
  font-size: 12px;
  color: #9a8878;
  line-height: 1.5;
}

.btn-action {
  margin-top: 8px;
  padding: 8px 18px;
  background: #D94518;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-action:hover { background: #BB3510; }

/* Lista de candidaturas */
.candidaturas-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.candidatura-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px;
  border-radius: 10px;
  transition: background 0.1s;
}

.candidatura-row:hover { background: rgba(0,0,0,0.03); }

.candidatura-vaga {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1208;
  margin-bottom: 2px;
}

.candidatura-empresa {
  font-size: 12px;
  color: #9a8878;
}

.candidatura-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

.candidatura-data {
  font-size: 11px;
  color: #b8a898;
  white-space: nowrap;
}

/* Pipeline */
.pipeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pipeline-item {
  display: grid;
  grid-template-columns: 28px 1fr 100px;
  align-items: center;
  gap: 10px;
}

.pipeline-count {
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.pipeline-bar-wrap {
  height: 5px;
  background: #EDE8E0;
  border-radius: 3px;
  overflow: hidden;
}

.pipeline-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
  min-width: 3px;
}

.pipeline-label {
  font-size: 12px;
  color: #9a8878;
}
</style>