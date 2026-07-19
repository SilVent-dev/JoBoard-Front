<template>
  <div class="dashboard">

    <!-- Chip de meta semanal — renderizado no topbar do AppLayout.
         `defer` adia a resolução do alvo p/ depois do render, evitando alvo null
         quando AppLayout e Dashboard montam juntos (ex.: logout→login). -->
    <Teleport defer to="#topbar-actions">
      <div class="meta-chip">
        <span class="meta-ring">
          <span class="meta-ring-fill" :style="{ background: anelMeta }"></span>
          <span class="meta-ring-hole"></span>
        </span>
        <span class="meta-texto"><b>{{ candidaturasSemana }} de {{ META_SEMANAL }}</b> candidaturas essa semana</span>
      </div>
    </Teleport>

    <div class="metrics-grid">
      <div class="metric-card">
        <p class="metric-label">Candidaturas ativas</p>
        <p class="metric-value">{{ metricas.ativas }}</p>
        <p class="metric-sub">em processo agora</p>
      </div>

      <div class="metric-card metric-card--moss">
        <p class="metric-label">Em entrevista</p>
        <p class="metric-value">{{ metricas.entrevistas }}</p>
        <p class="metric-sub">seguindo bem</p>
      </div>

      <div class="metric-card metric-card--clay">
        <p class="metric-label">Próxima ação</p>
        <template v-if="proximaAcao">
          <p class="metric-acao">{{ proximaAcao.proximaAcaoDescricao }}</p>
          <p class="metric-sub">{{ proximaAcao.empresaNome }}{{ proximaAcao.quando ? ' · ' + proximaAcao.quando : '' }}</p>
        </template>
        <template v-else>
          <p class="metric-acao">Nada agendado</p>
          <p class="metric-sub">aproveite para avançar uma etapa</p>
        </template>
      </div>
    </div>

    <!-- ── Follow-ups vencidos e de hoje ── -->
    <div v-if="followupsPendentes.length > 0" class="section followups">
      <div class="section-header">
        <h3 class="section-title">Follow-ups para agora</h3>
        <RouterLink to="/candidaturas" class="section-link">Ir para as etapas →</RouterLink>
      </div>
      <div class="followups-list">
        <div v-for="c in followupsPendentes" :key="c.id" class="followup-row">
          <span class="followup-quando" :class="{ vencida: c.diasAtraso > 0 }">
            {{ c.diasAtraso > 0 ? `há ${c.diasAtraso}d` : 'hoje' }}
          </span>
          <div class="followup-info">
            <p class="followup-acao">{{ c.proximaAcaoDescricao }}</p>
            <p class="followup-vaga">{{ c.vagaTitulo }} · {{ c.empresaNome }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-body">
      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Andamento recente</h3>
          <RouterLink to="/candidaturas" class="section-link">Ver todas →</RouterLink>
        </div>

        <div v-if="carregando" class="sk-lista">
          <div v-for="n in 4" :key="n" class="sk-row"></div>
        </div>

        <div v-else-if="candidaturasRecentes.length === 0" class="empty-state">
          <div class="empty-icon"><Inbox :size="24" /></div>
          <p class="empty-title">Nenhuma candidatura ainda</p>
          <p class="empty-sub">Cadastre uma empresa, uma vaga e comece a rastrear.</p>
          <RouterLink to="/empresas" class="btn-action">Começar agora</RouterLink>
        </div>

        <div v-else class="candidaturas-list">
          <div v-for="c in candidaturasRecentes" :key="c.id" class="candidatura-row">
            <div class="candidatura-info">
              <p class="candidatura-vaga">{{ c.vagaTitulo }}</p>
              <p class="candidatura-empresa">{{ c.empresaNome }}</p>
            </div>
            <div class="candidatura-right">
              <span class="status-badge" :style="statusStyle(c.status)">{{ statusLabel(c.status) }}</span>
              <span class="candidatura-data">{{ formatarData(c.criadoEm) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h3 class="section-title">Por etapa</h3>
        </div>
        <div class="pipeline">
          <div v-for="etapa in pipeline" :key="etapa.status" class="pipeline-item">
            <div class="pipeline-count" :style="{ color: etapa.cor }">{{ etapa.total }}</div>
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
import { listar } from '@/api/candidaturas'
import { STATUS, ETAPAS_PIPELINE, statusLabel, statusStyle } from '@/constants/status'
import { Inbox } from 'lucide-vue-next'

const candidaturas = ref([])
const carregando = ref(true)

const META_SEMANAL = 5
const STATUS_FINAIS = ['ACEITA', 'REJEITADA', 'DESISTIDA']

const metricas = computed(() => ({
  total:       candidaturas.value.length,
  ativas:      candidaturas.value.filter(c => !STATUS_FINAIS.includes(c.status)).length,
  entrevistas: candidaturas.value.filter(c => ['TRIAGEM_TELEFONICA','ENTREVISTA_TECNICA','ENTREVISTA_COMPORTAMENTAL'].includes(c.status)).length,
}))

const candidaturasSemana = computed(() => {
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  return candidaturas.value.filter(c => c.criadoEm && new Date(c.criadoEm) >= seteDiasAtras).length
})

const anelMeta = computed(() => {
  const pct = Math.min(candidaturasSemana.value / META_SEMANAL * 100, 100)
  return `conic-gradient(var(--moss) 0% ${pct}%, var(--border) ${pct}% 100%)`
})

const proximaAcao = computed(() => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const comAcao = candidaturas.value
    .filter(c => c.proximaAcaoDescricao && !STATUS_FINAIS.includes(c.status))
    .sort((a, b) => {
      if (!a.proximaAcaoEm) return 1
      if (!b.proximaAcaoEm) return -1
      return new Date(a.proximaAcaoEm) - new Date(b.proximaAcaoEm)
    })
  if (comAcao.length === 0) return null
  const futuras = comAcao.filter(c => c.proximaAcaoEm && parseData(c.proximaAcaoEm) >= hoje)
  const escolhida = futuras[0] || comAcao[0]
  return { ...escolhida, quando: formatarProximaAcao(escolhida.proximaAcaoEm) }
})

// Follow-ups vencidos ou de hoje, mais atrasados primeiro
const followupsPendentes = computed(() => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  return candidaturas.value
    .filter(c => c.proximaAcaoEm && c.proximaAcaoDescricao && !STATUS_FINAIS.includes(c.status))
    .map(c => ({ ...c, diasAtraso: Math.round((hoje - parseData(c.proximaAcaoEm)) / 86400000) }))
    .filter(c => c.diasAtraso >= 0)
    .sort((a, b) => b.diasAtraso - a.diasAtraso)
})

const candidaturasRecentes = computed(() =>
  [...candidaturas.value].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 5)
)

const pipeline = computed(() => ETAPAS_PIPELINE.map(s => ({
  status: s,
  label:  STATUS[s].label,
  cor:    STATUS[s].cor,
  total:  candidaturas.value.filter(c => c.status === s).length,
})))

// proximaAcaoEm é LocalDate ("2026-07-16") — parse local para não deslocar o dia por fuso
function parseData(data) {
  const [ano, mes, dia] = String(data).split('T')[0].split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

function formatarProximaAcao(data) {
  if (!data) return ''
  const d = parseData(data)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const diffDias = Math.round((d - hoje) / 86400000)
  if (diffDias === 0) return 'hoje'
  if (diffDias === 1) return 'amanhã'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

onMounted(async () => {
  try {
    const { data } = await listar()
    candidaturas.value = data
  } catch {
    candidaturas.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--sp-6); }

/* ── Chip de meta semanal (teleportado ao topbar) ── */
.meta-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 7px 16px 7px 7px;
}

.meta-ring {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.meta-ring-fill {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.meta-ring-hole {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--surface);
  z-index: 1;
}

.meta-texto { font-size: 12px; color: var(--text-secondary); }
.meta-texto b { color: var(--text-primary); }

/* ── 3 cards assimétricos ── */
.metrics-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1.1fr;
  gap: 14px;
}

.metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: var(--shadow-sm);
}

.metric-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.metric-value {
  font-size: 38px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 4px;
}

.metric-sub { font-size: 12px; color: var(--text-muted); }

.metric-card--moss {
  background: var(--moss);
  border: none;
}
.metric-card--moss .metric-label { color: rgba(241, 243, 236, 0.7); }
.metric-card--moss .metric-value { color: var(--text-inverse); }
.metric-card--moss .metric-sub   { color: rgba(241, 243, 236, 0.65); }

.metric-card--clay {
  background: var(--clay);
  border: none;
}
.metric-card--clay .metric-label { color: rgba(32, 36, 30, 0.65); margin-bottom: 10px; }
.metric-card--clay .metric-sub   { color: rgba(32, 36, 30, 0.7); }

.metric-acao {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 3px;
}

/* ── Body ── */
.dashboard-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
  align-items: start;
}

.section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-link {
  font-size: 12px;
  color: var(--moss);
  font-weight: 600;
  text-decoration: none;
}
.section-link:hover { text-decoration: underline; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--sp-8) var(--sp-4); gap: var(--sp-2); }
.empty-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--surface-alt); color: var(--text-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
.btn-action { margin-top: var(--sp-2); padding: var(--sp-2) var(--sp-4); background: var(--moss); color: var(--text-inverse); border-radius: var(--radius-md); font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.15s; }
.btn-action:hover { background: var(--moss-hover); }

/* Follow-ups para agora */
.followups-list { display: flex; flex-direction: column; }

.followup-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 6px;
  border-radius: 10px;
  transition: background 0.1s;
}
.followup-row:hover { background: var(--bg); }

.followup-quando {
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  color: var(--moss);
  background: var(--moss-subtle);
}

.followup-quando.vencida {
  color: var(--clay);
  background: var(--clay-subtle);
}

.followup-info { min-width: 0; }
.followup-acao { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.followup-vaga { font-size: 12px; color: var(--text-muted); }

/* Andamento recente */
.candidaturas-list { display: flex; flex-direction: column; }
.candidatura-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 6px; border-radius: 10px; transition: background 0.1s; gap: 12px; }
.candidatura-row:hover { background: var(--bg); }
.candidatura-info { min-width: 0; }
.candidatura-vaga { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.candidatura-empresa { font-size: 12px; color: var(--text-muted); }
.candidatura-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.candidatura-data { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

/* Skeleton */
.sk-lista { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; }
.sk-row { height: 44px; border-radius: 10px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-row::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimmer 1.3s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* Por etapa */
.pipeline { display: flex; flex-direction: column; gap: 16px; }
.pipeline-item { display: grid; grid-template-columns: 20px 1fr 78px; align-items: center; gap: 10px; }
.pipeline-count { font-size: 13px; font-weight: 700; text-align: center; }
.pipeline-bar-wrap { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.pipeline-bar { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.pipeline-label { font-size: 11.5px; color: var(--text-muted); }
</style>
