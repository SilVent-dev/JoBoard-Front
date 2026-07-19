<template>
  <div class="insights">

    <div v-if="carregando" class="empty-state">
      <p>Carregando...</p>
    </div>

    <div v-else-if="!dados || dados.totalCandidaturas === 0" class="empty-state section">
      <div class="empty-icon"><BarChart3 :size="24" /></div>
      <p class="empty-title">Ainda não há histórico suficiente</p>
      <p class="empty-sub">Conforme suas candidaturas avançarem pelas etapas, os insights aparecem aqui.</p>
      <RouterLink to="/candidaturas" class="btn-action">Ver candidaturas</RouterLink>
    </div>

    <template v-else>
      <!-- ── Números-chave ── -->
      <div class="metrics-grid">
        <div class="metric-card">
          <p class="metric-label">Candidaturas com histórico</p>
          <p class="metric-value">{{ dados.totalCandidaturas }}</p>
          <p class="metric-sub">desde o começo</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">Aplicações enviadas</p>
          <p class="metric-value">{{ dados.totalAplicadas }}</p>
          <p class="metric-sub">saíram da wishlist</p>
        </div>
        <div class="metric-card metric-card--moss">
          <p class="metric-label">Taxa de resposta</p>
          <p class="metric-value">{{ dados.taxaRespostaPercentual }}%</p>
          <p class="metric-sub">das aplicações tiveram retorno</p>
        </div>
      </div>

      <div class="insights-body">
        <!-- ── Funil de conversão ── -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">Funil de conversão</h3>
            <span class="section-hint">quantas candidaturas atingiram cada etapa</span>
          </div>
          <div class="barras">
            <div
              v-for="etapa in dados.funil"
              :key="etapa.status"
              class="barra-item"
              :title="`${statusLabel(etapa.status)}: ${etapa.quantidade}`"
            >
              <div class="barra-count" :style="{ color: corStatus(etapa.status) }">{{ etapa.quantidade }}</div>
              <div class="barra-wrap">
                <div
                  class="barra-fill"
                  :style="{
                    width: larguraFunil(etapa.quantidade),
                    background: corStatus(etapa.status)
                  }"
                ></div>
              </div>
              <div class="barra-label">{{ statusLabel(etapa.status) }}</div>
            </div>
          </div>
        </div>

        <!-- ── Tempo médio por etapa ── -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">Tempo médio em cada etapa</h3>
            <span class="section-hint">em dias, do seu histórico</span>
          </div>

          <div v-if="dados.temposMedios.length === 0" class="empty-sub sem-dados">
            Avance candidaturas de etapa para medir o tempo em cada uma.
          </div>

          <div v-else class="barras">
            <div
              v-for="tempo in dados.temposMedios"
              :key="tempo.status"
              class="barra-item"
              :title="`${statusLabel(tempo.status)}: ${tempo.diasMedios} dias em média`"
            >
              <div class="barra-count barra-count--dias">{{ tempo.diasMedios }}d</div>
              <div class="barra-wrap">
                <div
                  class="barra-fill barra-fill--tempo"
                  :style="{ width: larguraTempo(tempo.diasMedios) }"
                ></div>
              </div>
              <div class="barra-label">{{ statusLabel(tempo.status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gerar } from '@/api/insights'
import { STATUS, statusLabel } from '@/constants/status'
import { BarChart3 } from 'lucide-vue-next'

const dados = ref(null)
const carregando = ref(true)

const maxFunil = computed(() =>
  Math.max(...(dados.value?.funil.map(e => e.quantidade) || [0]), 1)
)

const maxTempo = computed(() =>
  Math.max(...(dados.value?.temposMedios.map(t => t.diasMedios) || [0]), 1)
)

const corStatus = (s) => STATUS[s]?.cor || 'var(--text-muted)'
const larguraFunil = (qtd) => (qtd / maxFunil.value * 100) + '%'
const larguraTempo = (dias) => (dias / maxTempo.value * 100) + '%'

onMounted(async () => {
  try {
    const { data } = await gerar()
    dados.value = data
  } catch {
    dados.value = null
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.insights { display: flex; flex-direction: column; gap: var(--sp-6); }

/* Números-chave — mesmo desenho dos cards do dashboard */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.1fr;
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

.metric-card--moss { background: var(--moss); border: none; }
.metric-card--moss .metric-label { color: rgba(241, 243, 236, 0.7); }
.metric-card--moss .metric-value { color: var(--text-inverse); }
.metric-card--moss .metric-sub   { color: rgba(241, 243, 236, 0.65); }

/* Corpo em duas colunas */
.insights-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-hint { font-size: 11px; color: var(--text-muted); }

/* Barras — mesmo padrão do "Por etapa" do dashboard */
.barras { display: flex; flex-direction: column; gap: 16px; }

.barra-item {
  display: grid;
  grid-template-columns: 34px 1fr 96px;
  align-items: center;
  gap: 10px;
}

.barra-count { font-size: 13px; font-weight: 700; text-align: center; }
.barra-count--dias { color: var(--moss); }

.barra-wrap {
  height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.barra-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.barra-fill--tempo { background: var(--moss); }

.barra-label { font-size: 11.5px; color: var(--text-muted); }

.sem-dados { padding: 8px 0; font-size: 12.5px; color: var(--text-muted); }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--sp-8) var(--sp-4); gap: var(--sp-2); }
.empty-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--surface-alt); color: var(--text-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
.btn-action { margin-top: var(--sp-2); padding: var(--sp-2) var(--sp-4); background: var(--moss); color: var(--text-inverse); border-radius: var(--radius-md); font-size: 13px; font-weight: 600; text-decoration: none; }
.btn-action:hover { background: var(--moss-hover); }
</style>
