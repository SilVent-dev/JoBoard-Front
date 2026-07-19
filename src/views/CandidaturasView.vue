<template>
  <div class="candidaturas-view">

    <div class="view-bar">
      <div class="search-wrap">
        <Search :size="13" class="search-icon" />
        <input v-model="busca" type="text" placeholder="Buscar vaga ou empresa..." class="search-input" />
      </div>
      <div class="toggle-view">
        <button :class="['toggle-btn', { active: viewMode === 'lista' }]" @click="viewMode = 'lista'">Lista</button>
        <button :class="['toggle-btn', { active: viewMode === 'kanban' }]" @click="viewMode = 'kanban'">Painel</button>
      </div>
      <button class="btn-primary" @click="abrirModalNova"><Plus :size="14" /> Nova candidatura</button>
    </div>

    <div v-if="carregando" class="lista">
      <div v-for="n in 5" :key="n" class="sk-row"></div>
    </div>

    <div v-else-if="candidaturasFiltradas.length === 0 && !busca" class="empty-state">
      <div class="empty-icon"><ClipboardList :size="22" /></div>
      <p class="empty-title">Nenhuma candidatura ativa</p>
      <p class="empty-sub">Cadastre uma empresa, uma vaga e comece a rastrear seu processo seletivo.</p>
      <button class="btn-primary" @click="abrirModalNova"><Plus :size="13" /> Nova candidatura</button>
    </div>

    <div v-else-if="candidaturasFiltradas.length === 0" class="empty-state">
      <p class="empty-sub">Nenhuma candidatura encontrada para "{{ busca }}".</p>
    </div>

    <!-- VIEW: Lista / Painel -->
    <template v-else>
      <Transition name="fade" mode="out-in">
      <div v-if="viewMode === 'lista'" key="lista" class="lista">
      <div v-for="c in candidaturasFiltradas" :key="c.id" class="lista-row" @click="abrirDetalhe(c)">
        <div class="lista-left">
          <div class="lista-avatar">{{ iniciais(c.empresaNome) }}</div>
          <div class="lista-info">
            <p class="lista-titulo">{{ c.vagaTitulo }}</p>
            <p class="lista-empresa">{{ c.empresaNome }}</p>
          </div>
        </div>
        <span v-if="c.proximaAcaoDescricao" class="lista-proxima" :title="c.proximaAcaoDescricao">{{ proximaAcaoTexto(c) }}</span>
        <div class="lista-right">
          <span class="status-badge" :style="statusStyle(c.status)">{{ statusLabel(c.status) }}</span>
          <span class="lista-data">{{ formatarData(c.criadoEm) }}</span>
          <button class="icon-btn danger" @click.stop="confirmarArquivar(c)" title="Arquivar" v-if="isEstadoFinal(c)"><Archive :size="12" /></button>
        </div>
      </div>
    </div>

      <div v-else key="kanban" class="kanban">
      <div v-for="coluna in colunas" :key="coluna.status" class="kanban-col">
        <div class="kanban-col-header">
          <span class="kanban-col-titulo">{{ coluna.label }}</span>
          <span class="kanban-col-count">{{ candidaturasPorStatus(coluna.status).length }}</span>
        </div>
        <div class="kanban-cards">
          <div v-for="c in candidaturasPorStatus(coluna.status)" :key="c.id" class="kanban-card" @click="abrirDetalhe(c)">
            <p class="kanban-titulo">{{ c.vagaTitulo }}</p>
            <p class="kanban-empresa">{{ c.empresaNome }}</p>
            <div class="kanban-footer">
              <span class="kanban-data">{{ formatarData(c.criadoEm) }}</span>
              <div v-if="c.minhaAvaliacaoInteresse" class="kanban-interesse">
                <Star :size="10" />{{ c.minhaAvaliacaoInteresse }}
              </div>
            </div>
          </div>
          <div v-if="candidaturasPorStatus(coluna.status).length === 0" class="kanban-empty"><p>Nenhuma</p></div>
        </div>
      </div>
      </div>
      </Transition>
    </template>

    <!-- Modal detalhe -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="detalheAberto && candidaturaAtiva" class="modal-overlay" @click.self="detalheAberto = false">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ candidaturaAtiva.vagaTitulo }}</h3>
              <p class="modal-sub">{{ candidaturaAtiva.empresaNome }}</p>
            </div>
            <div class="modal-header-right">
              <span class="status-badge" :style="statusStyle(candidaturaAtiva.status)">{{ statusLabel(candidaturaAtiva.status) }}</span>
              <button class="icon-btn" @click="detalheAberto = false"><X :size="15" /></button>
            </div>
          </div>

          <div class="modal-body-split">
            <div class="detalhe-main">
              <div class="avancar-status">
                <p class="detalhe-label">Progresso</p>

                <div v-if="!ehStatusFinal(candidaturaAtiva.status)" class="trilha">
                  <div
                    v-for="(etapa, i) in ETAPAS_PIPELINE"
                    :key="etapa"
                    class="trilha-etapa"
                    :class="{ ativa: etapa === candidaturaAtiva.status, feita: indiceStatus(candidaturaAtiva.status) > i }"
                    :title="statusLabel(etapa)"
                  >
                    <span class="trilha-ponto"></span>
                    <span class="trilha-nome">{{ statusLabel(etapa) }}</span>
                  </div>
                </div>
                <div v-else class="trilha-final" :style="statusStyle(candidaturaAtiva.status)">
                  Processo encerrado — {{ statusLabel(candidaturaAtiva.status) }}
                </div>

                <template v-if="proximosStatus(candidaturaAtiva.status).length > 0">
                  <p class="detalhe-sublabel">Avançar para</p>
                  <div class="status-opcoes">
                    <button v-for="s in proximosStatus(candidaturaAtiva.status)" :key="s" class="status-btn" :style="statusStyle(s)" @click="atualizarStatus(s)" :disabled="atualizando">{{ statusLabel(s) }}</button>
                  </div>
                </template>
              </div>

              <div class="historico-section">
                <p class="detalhe-label">Histórico</p>
                <div v-if="historico.length === 0" class="historico-empty"><p>Nenhum evento registrado.</p></div>
                <div class="timeline">
                  <div v-for="(evento, i) in historico" :key="evento.id" class="timeline-item">
                    <div class="timeline-dot" :class="tipoEventoClass(evento.tipoEvento)"></div>
                    <div v-if="i < historico.length - 1" class="timeline-line"></div>
                    <div class="timeline-content">
                      <p class="timeline-titulo">{{ evento.tituloEvento }}</p>
                      <p v-if="evento.descricao" class="timeline-desc">{{ evento.descricao }}</p>
                      <p class="timeline-data">{{ formatarData(evento.dataEvento) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="nota-section">
                <p class="detalhe-label">Nota</p>
                <textarea v-model="notaTexto" placeholder="O que vale lembrar sobre essa conversa..." rows="3" class="nota-input"></textarea>
                <button class="btn-sm-primary" @click="salvarNota" :disabled="salvandoNota">{{ salvandoNota ? 'Salvando...' : 'Salvar nota' }}</button>
              </div>
            </div>

            <div class="detalhe-side">
              <div class="side-card">
                <p class="detalhe-label">Informações</p>
                <div class="info-row" v-if="candidaturaAtiva.dataAplicacao"><Calendar :size="12" class="info-icon" /><span>Aplicado em {{ formatarData(candidaturaAtiva.dataAplicacao) }}</span></div>
                <div class="info-row" v-if="candidaturaAtiva.plataformaAplicacao"><Globe :size="12" class="info-icon" /><span>{{ candidaturaAtiva.plataformaAplicacao }}</span></div>
                <div class="info-row" v-if="candidaturaAtiva.minhaAvaliacaoInteresse"><Star :size="12" class="info-icon" /><span>Interesse: {{ candidaturaAtiva.minhaAvaliacaoInteresse }}/5</span></div>
                <div class="info-row" v-if="candidaturaAtiva.minhaAvaliacaoFit"><Target :size="12" class="info-icon" /><span>Fit: {{ candidaturaAtiva.minhaAvaliacaoFit }}/5</span></div>
                <div class="info-row" v-if="candidaturaAtiva.proximaAcaoDescricao"><Clock :size="12" class="info-icon" /><span>{{ candidaturaAtiva.proximaAcaoDescricao }}</span></div>
              </div>

              <div class="side-card">
                <div class="side-card-header">
                  <p class="detalhe-label">Contatos</p>
                  <button class="btn-xs" @click="modalContatoAberto = true"><Plus :size="11" /></button>
                </div>
                <div v-if="contatos.length === 0" class="contatos-empty"><p>Nenhum contato adicionado.</p></div>
                <div v-for="contato in contatos" :key="contato.id" class="contato-item">
                  <div class="contato-avatar">{{ iniciais(contato.nome) }}</div>
                  <div class="contato-info">
                    <p class="contato-nome">{{ contato.nome }}</p>
                    <p class="contato-cargo">{{ contato.cargo }} · {{ tipoContatoLabel(contato.tipoContato) }}</p>
                  </div>
                  <button class="icon-btn danger" @click="removerContato(contato.id)"><Trash2 :size="11" /></button>
                </div>
              </div>

              <button v-if="isEstadoFinal(candidaturaAtiva)" class="btn-arquivar" @click="confirmarArquivar(candidaturaAtiva)">
                <Archive :size="13" /> Arquivar candidatura
              </button>
            </div>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal novo contato -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="modalContatoAberto" class="modal-overlay" @click.self="modalContatoAberto = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Adicionar contato</h3>
            <button class="icon-btn" @click="modalContatoAberto = false"><X :size="15" /></button>
          </div>
          <div class="modal-form">
            <div class="form-row">
              <div class="field"><label>Nome *</label><input v-model="novoContato.nome" type="text" placeholder="Nome do contato" /></div>
              <div class="field"><label>Cargo</label><input v-model="novoContato.cargo" type="text" placeholder="Ex: Recrutadora" /></div>
            </div>
            <div class="form-row">
              <div class="field">
                <label>Tipo *</label>
                <select v-model="novoContato.tipoContato">
                  <option value="">Selecionar</option>
                  <option value="RECRUTADOR">Recrutador</option>
                  <option value="TECH_LEAD">Tech Lead</option>
                  <option value="GESTOR_DIRETO">Gestor Direto</option>
                  <option value="RH">RH</option>
                  <option value="COLEGA_EQUIPE">Colega de Equipe</option>
                  <option value="FUNDADOR">Fundador</option>
                </select>
              </div>
              <div class="field"><label>Email</label><input v-model="novoContato.email" type="email" placeholder="email@empresa.com" /></div>
            </div>
            <div class="field"><label>LinkedIn</label><input v-model="novoContato.linkedin" type="text" placeholder="linkedin.com/in/..." /></div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="modalContatoAberto = false">Cancelar</button>
            <button class="btn-primary" @click="salvarContato" :disabled="salvando"><Loader2 v-if="salvando" :size="13" class="spin" />Adicionar</button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal nova candidatura -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="modalNovaAberto" class="modal-overlay" @click.self="modalNovaAberto = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Nova candidatura</h3>
            <button class="icon-btn" @click="modalNovaAberto = false"><X :size="15" /></button>
          </div>
          <div class="modal-form">
            <div class="field">
              <label>Vaga *</label>
              <select v-model="novaForm.vagaId">
                <option value="">Selecionar vaga</option>
                <option v-for="v in vagasDisponiveis" :key="v.id" :value="v.id">{{ v.titulo }} — {{ v.empresaNome }}</option>
              </select>
            </div>
            <div class="field"><label>Meu interesse (0-5)</label><input v-model="novaForm.minhaAvaliacaoInteresse" type="number" min="0" max="5" step="0.5" placeholder="Ex: 4.5" /></div>
            <div class="field"><label>Notas iniciais</label><textarea v-model="novaForm.notas" rows="2" placeholder="Observações sobre essa vaga..."></textarea></div>
            <p v-if="erroNova" class="form-erro">{{ erroNova }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="modalNovaAberto = false">Cancelar</button>
            <button class="btn-primary" @click="criarCandidatura" :disabled="salvando"><Loader2 v-if="salvando" :size="13" class="spin" />Criar</button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal arquivar -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="arquivarAlvo" class="modal-overlay" @click.self="arquivarAlvo = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Arquivar candidatura</h3>
            <button class="icon-btn" @click="arquivarAlvo = null"><X :size="15" /></button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">Arquivar candidatura para <strong>{{ arquivarAlvo.vagaTitulo }}</strong>? Ela será movida para o histórico.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="arquivarAlvo = null">Cancelar</button>
            <button class="btn-primary" @click="executarArquivar" :disabled="salvando"><Loader2 v-if="salvando" :size="13" class="spin" />Arquivar</button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Search, Plus, ClipboardList, Star, X, Archive, Calendar, Globe, Target, Clock, Trash2, Loader2 } from 'lucide-vue-next'
import { listar, criar, atualizarStatus as atualizarStatusApi, adicionarNota, arquivar, buscarHistorico, listarContatos, criarContato, deletarContato } from '@/api/candidaturas'
import { listar as listarVagas } from '@/api/vagas'
import { STATUS, ETAPAS_PIPELINE, statusLabel, statusStyle } from '@/constants/status'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const candidaturas = ref([])
const carregando = ref(true)
const busca = ref('')
const viewMode = ref('lista')
const salvando = ref(false)
const salvandoNota = ref(false)
const atualizando = ref(false)
const detalheAberto = ref(false)
const candidaturaAtiva = ref(null)
const historico = ref([])
const contatos = ref([])
const notaTexto = ref('')
const modalNovaAberto = ref(false)
const modalContatoAberto = ref(false)
const arquivarAlvo = ref(null)
const erroNova = ref('')
const vagasDisponiveis = ref([])

const novaForm = reactive({ vagaId: '', minhaAvaliacaoInteresse: '', notas: '' })
const novoContato = reactive({ nome: '', cargo: '', tipoContato: '', email: '', linkedin: '' })

const colunas = ETAPAS_PIPELINE.map(s => ({ status: s, label: STATUS[s].label }))

const TRANSICOES = {
  LISTA_DESEJO: ['APLICADA', 'DESISTIDA'],
  APLICADA: ['TRIAGEM_TELEFONICA', 'REJEITADA', 'DESISTIDA'],
  TRIAGEM_TELEFONICA: ['ENTREVISTA_TECNICA', 'REJEITADA', 'DESISTIDA'],
  ENTREVISTA_TECNICA: ['ENTREVISTA_COMPORTAMENTAL', 'TESTE_PRATICO', 'REJEITADA', 'DESISTIDA'],
  ENTREVISTA_COMPORTAMENTAL: ['TESTE_PRATICO', 'PROPOSTA_RECEBIDA', 'REJEITADA', 'DESISTIDA'],
  TESTE_PRATICO: ['PROPOSTA_RECEBIDA', 'REJEITADA', 'DESISTIDA'],
  PROPOSTA_RECEBIDA: ['ACEITA', 'REJEITADA', 'DESISTIDA'],
}

const proximosStatus = (s) => TRANSICOES[s] || []
const isEstadoFinal = (c) => ['ACEITA','REJEITADA','DESISTIDA'].includes(c.status)
const ehStatusFinal = (s) => ['ACEITA','REJEITADA','DESISTIDA'].includes(s)
const indiceStatus = (s) => ETAPAS_PIPELINE.indexOf(s)
const tipoEventoClass = (tipo) => ({ MUDANCA_STATUS: 'dot-status', NOTA_ADICIONADA: 'dot-nota', ENTREVISTA_AGENDADA: 'dot-entrevista', ENTREVISTA_REALIZADA: 'dot-entrevista', FEEDBACK_RECEBIDO: 'dot-feedback' }[tipo] || 'dot-default')
const tipoContatoLabel = (t) => ({ RECRUTADOR: 'Recrutador', TECH_LEAD: 'Tech Lead', GESTOR_DIRETO: 'Gestor', RH: 'RH', COLEGA_EQUIPE: 'Colega', FUNDADOR: 'Fundador' }[t] || t)
function iniciais(nome) { return (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }
function formatarData(data) { if (!data) return ''; return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }

// proximaAcaoEm é LocalDate ("2026-07-16") — parse local para não deslocar o dia por fuso
function proximaAcaoTexto(c) {
  if (!c.proximaAcaoEm) return c.proximaAcaoDescricao
  const [ano, mes, dia] = String(c.proximaAcaoEm).split('T')[0].split('-').map(Number)
  const d = new Date(ano, mes - 1, dia)
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const diffDias = Math.round((d - hoje) / 86400000)
  if (diffDias === 0) return 'hoje'
  if (diffDias === 1) return 'amanhã'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const candidaturasFiltradas = computed(() => {
  if (!busca.value) return candidaturas.value
  const q = busca.value.toLowerCase()
  return candidaturas.value.filter(c => c.vagaTitulo?.toLowerCase().includes(q) || c.empresaNome?.toLowerCase().includes(q))
})
const candidaturasPorStatus = (status) => candidaturasFiltradas.value.filter(c => c.status === status)

async function abrirDetalhe(c) {
  candidaturaAtiva.value = c; notaTexto.value = c.notas || ''; detalheAberto.value = true; historico.value = []; contatos.value = []
  try { const [h, ct] = await Promise.all([buscarHistorico(c.id), listarContatos(c.id)]); historico.value = h.data; contatos.value = ct.data } catch { /* silencioso */ }
}

async function atualizarStatus(novoStatus) {
  if (!candidaturaAtiva.value) return; atualizando.value = true
  try {
    const { data } = await atualizarStatusApi(candidaturaAtiva.value.id, { novoStatus })
    candidaturaAtiva.value = data
    const idx = candidaturas.value.findIndex(c => c.id === data.id); if (idx !== -1) candidaturas.value[idx] = data
    const h = await buscarHistorico(data.id); historico.value = h.data
    toast.sucesso(`Movida para ${statusLabel(novoStatus)}.`)
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível mudar o status.') } finally { atualizando.value = false }
}

async function salvarNota() {
  if (!candidaturaAtiva.value || !notaTexto.value.trim()) return; salvandoNota.value = true
  try {
    const { data } = await adicionarNota(candidaturaAtiva.value.id, { nota: notaTexto.value })
    candidaturaAtiva.value = data
    const idx = candidaturas.value.findIndex(c => c.id === data.id); if (idx !== -1) candidaturas.value[idx] = data
    const h = await buscarHistorico(data.id); historico.value = h.data
    toast.sucesso('Nota salva.')
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível salvar a nota.') } finally { salvandoNota.value = false }
}

async function salvarContato() {
  if (!novoContato.nome || !novoContato.tipoContato) return; salvando.value = true
  try {
    const { data } = await criarContato(candidaturaAtiva.value.id, { ...novoContato })
    contatos.value.push(data); Object.assign(novoContato, { nome: '', cargo: '', tipoContato: '', email: '', linkedin: '' }); modalContatoAberto.value = false
    toast.sucesso('Contato adicionado.')
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível adicionar o contato.') } finally { salvando.value = false }
}

async function removerContato(contatoId) {
  try {
    await deletarContato(candidaturaAtiva.value.id, contatoId)
    contatos.value = contatos.value.filter(c => c.id !== contatoId)
    toast.sucesso('Contato removido.')
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível remover o contato.') }
}

function confirmarArquivar(c) { arquivarAlvo.value = c; if (detalheAberto.value) detalheAberto.value = false }

async function executarArquivar() {
  salvando.value = true
  try {
    await arquivar(arquivarAlvo.value.id)
    candidaturas.value = candidaturas.value.filter(c => c.id !== arquivarAlvo.value.id)
    toast.sucesso('Candidatura arquivada.')
    arquivarAlvo.value = null
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível arquivar.') } finally { salvando.value = false }
}

async function abrirModalNova() {
  erroNova.value = ''; Object.assign(novaForm, { vagaId: '', minhaAvaliacaoInteresse: '', notas: '' })
  try { const { data } = await listarVagas({ vagaAindaAberta: true }); vagasDisponiveis.value = data } catch { vagasDisponiveis.value = [] }
  modalNovaAberto.value = true
}

async function criarCandidatura() {
  if (!novaForm.vagaId) { erroNova.value = 'Selecione uma vaga.'; return }; salvando.value = true; erroNova.value = ''
  try {
    const dados = { vagaId: novaForm.vagaId, minhaAvaliacaoInteresse: novaForm.minhaAvaliacaoInteresse || null, notas: novaForm.notas || null }
    const { data } = await criar(dados); candidaturas.value.unshift(data); modalNovaAberto.value = false
    toast.sucesso('Candidatura criada.')
  } catch (e) { erroNova.value = e.response?.data?.mensagem || 'Erro ao criar candidatura.' } finally { salvando.value = false }
}

onMounted(async () => {
  try { const { data } = await listar(); candidaturas.value = data } catch { candidaturas.value = [] } finally { carregando.value = false }
})
</script>

<style scoped>
.candidaturas-view { display: flex; flex-direction: column; gap: var(--sp-4); }

.view-bar { display: flex; align-items: center; gap: var(--sp-2); }
.search-wrap { position: relative; flex: 1; max-width: 260px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 9px 14px 9px 32px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); font-size: 13px; color: var(--text-primary); outline: none; }
.search-input:focus { border-color: var(--moss); }
.search-input::placeholder { color: var(--text-muted); }

.toggle-view { display: flex; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.toggle-btn { padding: 8px 14px; border: none; background: var(--surface); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; font-size: 12px; font-weight: 600; transition: background 0.1s, color 0.1s; }
.toggle-btn.active { background: var(--moss); color: var(--text-inverse); }

.btn-primary { display: flex; align-items: center; gap: var(--sp-2); padding: 9px var(--sp-4); background: var(--moss); color: var(--text-inverse); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; margin-left: auto; white-space: nowrap; }
.btn-primary:hover:not(:disabled) { background: var(--moss-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--sp-16) var(--sp-6); gap: var(--sp-2); }
.empty-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

/* Lista */
.lista { display: flex; flex-direction: column; gap: 8px; }
.lista-row { position: relative; display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-radius: 14px; background: var(--surface); border: 1px solid var(--border); cursor: pointer; transition: box-shadow 0.15s, transform 0.1s; gap: 14px; box-shadow: var(--shadow-sm); }
.lista-row:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
/* :has() — sinaliza linhas com follow-up pendente sem lógica no JS */
.lista-row:has(.lista-proxima)::before { content: ''; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 0 3px 3px 0; background: var(--clay); }
.lista-left { display: flex; align-items: center; gap: var(--sp-3); flex: 1; min-width: 0; }
.lista-avatar { width: 34px; height: 34px; border-radius: 10px; background: var(--moss-subtle); color: var(--moss); font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lista-titulo { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.lista-empresa { font-size: 12px; color: var(--text-muted); }
.lista-proxima { font-size: 11px; font-weight: 600; color: var(--clay); white-space: nowrap; flex-shrink: 0; }
.lista-right { display: flex; align-items: center; gap: var(--sp-3); flex-shrink: 0; }
.lista-data { font-size: 11px; color: var(--text-muted); }
.status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }

/* Kanban */
.kanban { display: flex; gap: var(--sp-3); overflow-x: auto; padding-bottom: var(--sp-2); }
.kanban-col { min-width: 190px; flex-shrink: 0; display: flex; flex-direction: column; gap: var(--sp-2); }
.kanban-col-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 4px; }
.kanban-col-titulo { font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.kanban-col-count { font-size: 10.5px; font-weight: 600; padding: 1px 7px; border-radius: 10px; background: var(--surface-alt); color: var(--text-muted); }
.kanban-cards { display: flex; flex-direction: column; gap: var(--sp-2); }
.kanban-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: var(--sp-3); cursor: pointer; transition: box-shadow 0.15s, transform 0.1s; box-shadow: 0 1px 2px rgba(32, 36, 30, 0.03); }
.kanban-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.kanban-titulo { font-size: 12.5px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.kanban-empresa { font-size: 11.5px; color: var(--text-muted); margin-bottom: var(--sp-2); }
.kanban-footer { display: flex; align-items: center; justify-content: space-between; }
.kanban-data { font-size: 11px; color: var(--text-muted); }
.kanban-interesse { display: flex; align-items: center; gap: 3px; font-size: 11px; color: var(--warning); }
.kanban-empty { padding: var(--sp-4); text-align: center; font-size: 12px; color: var(--text-muted); background: var(--surface-alt); border-radius: var(--radius); border: 1px dashed var(--border); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(32,36,30,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--sp-6); }
.modal { background: var(--surface); border-radius: 18px; width: 100%; max-width: 540px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-xl); border: 1px solid var(--border); }
.modal-lg { max-width: 840px; }
.modal-sm { max-width: 400px; }
.modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: var(--sp-4) var(--sp-6) var(--sp-4); border-bottom: 1px solid var(--border); gap: var(--sp-3); }
.modal-title { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.modal-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.modal-header-right { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; }
.modal-form { padding: var(--sp-4) var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-3); }
.modal-body { padding: var(--sp-4) var(--sp-6); }
.modal-body-split { display: grid; grid-template-columns: 1fr 260px; gap: 0; min-height: 400px; }

/* Detalhe */
.detalhe-main { padding: var(--sp-4) var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-6); border-right: 1px solid var(--border); }
.detalhe-side { padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3); background: var(--surface-alt); }
.detalhe-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); margin-bottom: var(--sp-2); }

.avancar-status {}
.detalhe-sublabel { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); margin-bottom: var(--sp-2); }

/* Trilha de etapas */
.trilha { display: flex; margin-bottom: var(--sp-6); }
.trilha-etapa { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; position: relative; }
.trilha-etapa::before { content: ''; position: absolute; top: 5px; left: -50%; width: 100%; height: 2px; background: var(--border); z-index: 0; }
.trilha-etapa:first-child::before { display: none; }
.trilha-ponto { width: 11px; height: 11px; border-radius: 50%; background: var(--border); z-index: 1; transition: background 0.2s, box-shadow 0.2s; }
.trilha-nome { font-size: 8.5px; color: var(--text-muted); text-align: center; line-height: 1.2; letter-spacing: 0.01em; }
.trilha-etapa.feita .trilha-ponto { background: var(--moss); }
.trilha-etapa.feita::before,
.trilha-etapa.ativa::before { background: var(--moss); }
.trilha-etapa.ativa .trilha-ponto { background: var(--moss); box-shadow: 0 0 0 4px var(--moss-subtle); }
.trilha-etapa.ativa .trilha-nome { color: var(--moss); font-weight: 700; }
.trilha-final { display: inline-block; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: var(--sp-2); }

.status-opcoes { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
.status-btn { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: none; cursor: pointer; transition: opacity 0.1s, transform 0.1s; }
.status-btn:hover:not(:disabled) { opacity: 0.82; transform: translateY(-1px); }
.status-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.timeline { display: flex; flex-direction: column; }
.timeline-item { display: flex; gap: var(--sp-3); position: relative; padding-bottom: var(--sp-4); }
.timeline-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.dot-status { background: var(--moss); }
.dot-nota { background: var(--warning); }
.dot-entrevista { background: var(--info); }
.dot-feedback { background: var(--success); }
.dot-default { background: var(--text-muted); }
.timeline-line { position: absolute; left: 4px; top: 13px; bottom: 0; width: 1px; background: var(--border); }
.timeline-content { flex: 1; }
.timeline-titulo { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
.timeline-desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; line-height: 1.5; }
.timeline-data { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.historico-empty { font-size: 12px; color: var(--text-muted); }

.nota-input { width: 100%; padding: 8px var(--sp-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-alt); font-size: 13px; font-family: inherit; color: var(--text-primary); outline: none; resize: vertical; transition: border-color 0.15s; }
.nota-input:focus { border-color: var(--moss); background: var(--surface); }
.btn-sm-primary { padding: 6px var(--sp-3); background: var(--moss); color: var(--text-inverse); border: none; border-radius: var(--radius); font-size: 12px; font-weight: 600; cursor: pointer; margin-top: var(--sp-2); transition: background 0.15s; }
.btn-sm-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.side-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--sp-3); }
.side-card-header { display: flex; align-items: center; justify-content: space-between; }
.info-row { display: flex; align-items: center; gap: var(--sp-2); font-size: 12px; color: var(--text-secondary); padding: 3px 0; }
.info-icon { color: var(--text-muted); flex-shrink: 0; }

.contatos-empty { font-size: 12px; color: var(--text-muted); padding: var(--sp-2) 0; }
.contato-item { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-subtle); }
.contato-item:last-child { border-bottom: none; }
.contato-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--moss-subtle); color: var(--moss); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.contato-nome { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.contato-cargo { font-size: 11px; color: var(--text-muted); }
.contato-info { flex: 1; min-width: 0; }

.btn-xs { width: 20px; height: 20px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.btn-xs:hover { background: var(--border); color: var(--text-primary); }

.btn-arquivar { display: flex; align-items: center; justify-content: center; gap: var(--sp-2); width: 100%; padding: var(--sp-2); border: 1px solid var(--border); border-radius: var(--radius); background: none; font-size: 12.5px; font-weight: 500; color: var(--text-secondary); cursor: pointer; transition: background 0.1s; }
.btn-arquivar:hover { background: var(--border); }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.field { display: flex; flex-direction: column; gap: var(--sp-1); }
.field label { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
.field input, .field select, .field textarea { padding: 8px var(--sp-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-alt); color: var(--text-primary); font-size: 13px; font-family: inherit; outline: none; resize: vertical; transition: border-color 0.15s; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--moss); background: var(--surface); }
.field input::placeholder, .field textarea::placeholder { color: var(--text-muted); }
.form-erro { font-size: 12px; color: var(--danger); padding: var(--sp-2) var(--sp-3); background: var(--danger-subtle); border-radius: var(--radius); }
.modal-footer { display: flex; justify-content: flex-end; gap: var(--sp-2); padding: var(--sp-3) var(--sp-6) var(--sp-4); border-top: 1px solid var(--border); }
.btn-ghost { padding: 7px var(--sp-4); background: none; border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; }
.btn-ghost:hover { background: var(--surface-alt); }
.icon-btn { width: 26px; height: 26px; border-radius: var(--radius-sm); border: none; background: transparent; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.1s, color 0.1s; }
.icon-btn:hover { background: var(--border); color: var(--text-primary); }
.icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); }
.delete-msg { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

/* Skeleton */
.sk-row { height: 66px; border-radius: 14px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-row::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimmer 1.3s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* Transição entre abas Lista/Painel */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.fade-enter-from { opacity: 0; transform: translateY(6px); }
.fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* Transições de modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>