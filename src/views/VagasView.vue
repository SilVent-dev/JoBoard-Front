<template>
  <div class="vagas-view">

    <!-- Barra superior -->
    <div class="view-bar">
      <div class="search-wrap">
        <Search :size="14" class="search-icon" />
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar vaga ou empresa..."
          class="search-input"
        />
      </div>
      <div class="filtros">
        <select v-model="filtros.modeloTrabalho" class="filtro-select">
          <option value="">Modelo</option>
          <option value="REMOTO">Remoto</option>
          <option value="HIBRIDO">Híbrido</option>
          <option value="PRESENCIAL">Presencial</option>
        </select>
        <select v-model="filtros.tipoContrato" class="filtro-select">
          <option value="">Contrato</option>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="ESTAGIO">Estágio</option>
          <option value="FREELANCE">Freelance</option>
        </select>
        <select v-model="filtros.nivelExperiencia" class="filtro-select">
          <option value="">Nível</option>
          <option value="ESTAGIARIO">Estagiário</option>
          <option value="JUNIOR">Júnior</option>
          <option value="PLENO">Pleno</option>
          <option value="SENIOR">Sênior</option>
        </select>
        <select v-model="filtros.vagaAindaAberta" class="filtro-select">
          <option value="">Status</option>
          <option value="true">Abertas</option>
          <option value="false">Fechadas</option>
        </select>
        <button
          v-if="temFiltro"
          class="btn-ghost-sm"
          @click="limparFiltros"
        >
          <X :size="12" />
          Limpar
        </button>
      </div>
      <button class="btn-primary" @click="abrirModal()">
        <Plus :size="15" />
        Nova vaga
      </button>
    </div>

    <!-- Carregando -->
    <div v-if="carregando" class="empty-state">
      <p class="empty-sub">Carregando...</p>
    </div>

    <!-- Vazio -->
    <div v-else-if="vagasFiltradas.length === 0 && !busca && !temFiltro" class="empty-state">
      <div class="empty-icon"><Briefcase :size="26" /></div>
      <p class="empty-title">Nenhuma vaga cadastrada</p>
      <p class="empty-sub">Cadastre vagas de interesse e vincule a empresas do seu catálogo.</p>
      <button class="btn-primary" @click="abrirModal()">
        <Plus :size="14" /> Adicionar vaga
      </button>
    </div>

    <!-- Sem resultado -->
    <div v-else-if="vagasFiltradas.length === 0" class="empty-state">
      <p class="empty-sub">Nenhuma vaga encontrada com os filtros aplicados.</p>
    </div>

    <!-- Lista -->
    <div v-else class="vagas-lista">
      <div
        v-for="vaga in vagasFiltradas"
        :key="vaga.id"
        class="vaga-row"
      >
        <div class="vaga-left">
          <div class="vaga-avatar">{{ iniciais(vaga.empresaNome) }}</div>
          <div class="vaga-info">
            <div class="vaga-titulo-row">
              <h3 class="vaga-titulo">{{ vaga.titulo }}</h3>
              <span v-if="!vaga.vagaAindaAberta" class="tag-fechada">Fechada</span>
            </div>
            <p class="vaga-empresa">{{ vaga.empresaNome }}</p>
            <div class="vaga-tags">
              <span v-if="vaga.modeloTrabalho" class="tag" :class="modeloClass(vaga.modeloTrabalho)">
                {{ modeloLabel(vaga.modeloTrabalho) }}
              </span>
              <span v-if="vaga.tipoContrato" class="tag tag-neutro">
                {{ contratoLabel(vaga.tipoContrato) }}
              </span>
              <span v-if="vaga.nivelExperiencia" class="tag tag-neutro">
                {{ nivelLabel(vaga.nivelExperiencia) }}
              </span>
              <span v-if="vaga.faixaSalarial" class="tag tag-salario">
                {{ vaga.faixaSalarial }}
              </span>
            </div>
          </div>
        </div>

        <div class="vaga-right">
          <span class="vaga-data">{{ formatarData(vaga.criadoEm) }}</span>
          <div class="vaga-actions">
            <a v-if="vaga.urlVaga" :href="vaga.urlVaga" target="_blank" class="icon-btn" title="Ver vaga">
              <ExternalLink :size="13" />
            </a>
            <button class="icon-btn" @click="abrirModal(vaga)" title="Editar">
              <Pencil :size="13" />
            </button>
            <button
              v-if="vaga.vagaAindaAberta"
              class="icon-btn"
              @click="confirmarFechar(vaga)"
              title="Fechar vaga"
            >
              <Lock :size="13" />
            </button>
            <button class="icon-btn danger" @click="confirmarDelete(vaga)" title="Remover">
              <Trash2 :size="13" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal criar/editar -->
    <Teleport to="body">
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ editando ? 'Editar vaga' : 'Nova vaga' }}</h3>
            <button class="icon-btn" @click="fecharModal"><X :size="16" /></button>
          </div>

          <form class="modal-form" @submit.prevent="salvar">
            <div class="form-row">
              <div class="field">
                <label>Empresa *</label>
                <select v-model="form.empresaId" required>
                  <option value="">Selecionar empresa</option>
                  <option v-for="e in empresas" :key="e.id" :value="e.id">{{ e.nome }}</option>
                </select>
              </div>
              <div class="field">
                <label>Título *</label>
                <input v-model="form.titulo" type="text" placeholder="Ex: Dev Backend Jr" required />
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label>Modelo de trabalho</label>
                <select v-model="form.modeloTrabalho">
                  <option value="">Selecionar</option>
                  <option value="REMOTO">Remoto</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="PRESENCIAL">Presencial</option>
                </select>
              </div>
              <div class="field">
                <label>Tipo de contrato</label>
                <select v-model="form.tipoContrato">
                  <option value="">Selecionar</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                  <option value="ESTAGIO">Estágio</option>
                  <option value="TEMPORARIO">Temporário</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="field">
                <label>Nível</label>
                <select v-model="form.nivelExperiencia">
                  <option value="">Selecionar</option>
                  <option value="ESTAGIARIO">Estagiário</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="ESPECIALISTA">Especialista</option>
                </select>
              </div>
              <div class="field">
                <label>Faixa salarial</label>
                <input v-model="form.faixaSalarial" type="text" placeholder="Ex: R$ 5.000 - R$ 8.000" />
              </div>
            </div>

            <div class="field">
              <label>URL da vaga</label>
              <input v-model="form.urlVaga" type="url" placeholder="https://empresa.com/vaga" />
            </div>

            <div class="field">
              <label>Localização</label>
              <input v-model="form.localizacao" type="text" placeholder="Ex: São Paulo, SP" />
            </div>

            <div class="field">
              <label>Requisitos obrigatórios</label>
              <textarea v-model="form.requisitosObrigatorios" rows="2" placeholder="Java, Spring Boot, SQL..."></textarea>
            </div>

            <div class="field">
              <label>Requisitos desejáveis</label>
              <textarea v-model="form.requisitosDesejaveis" rows="2" placeholder="Kubernetes, Kafka..."></textarea>
            </div>

            <div class="field">
              <label>Benefícios</label>
              <input v-model="form.beneficios" type="text" placeholder="VR, plano de saúde, stock options..." />
            </div>

            <div class="field">
              <label>Descrição</label>
              <textarea v-model="form.descricao" rows="3" placeholder="Sobre a vaga..."></textarea>
            </div>

            <p v-if="erro" class="form-erro">{{ erro }}</p>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="fecharModal">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="salvando">
                <Loader2 v-if="salvando" :size="14" class="spin" />
                {{ salvando ? 'Salvando...' : editando ? 'Salvar' : 'Criar vaga' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal fechar vaga -->
    <Teleport to="body">
      <div v-if="fecharAlvo" class="modal-overlay" @click.self="fecharAlvo = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Fechar vaga</h3>
            <button class="icon-btn" @click="fecharAlvo = null"><X :size="16" /></button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">
              Marcar <strong>{{ fecharAlvo.titulo }}</strong> como fechada?
              Não será possível criar novas candidaturas para ela.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="fecharAlvo = null">Cancelar</button>
            <button class="btn-warning" @click="executarFechar" :disabled="salvando">
              <Loader2 v-if="salvando" :size="14" class="spin" />
              {{ salvando ? 'Fechando...' : 'Fechar vaga' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal delete -->
    <Teleport to="body">
      <div v-if="deleteAlvo" class="modal-overlay" @click.self="deleteAlvo = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Remover vaga</h3>
            <button class="icon-btn" @click="deleteAlvo = null"><X :size="16" /></button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">
              Remover <strong>{{ deleteAlvo.titulo }}</strong>?
              Candidaturas ativas vinculadas a ela não poderão ser removidas.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="deleteAlvo = null">Cancelar</button>
            <button class="btn-danger" @click="executarDelete" :disabled="salvando">
              <Loader2 v-if="salvando" :size="14" class="spin" />
              {{ salvando ? 'Removendo...' : 'Remover' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import {
  Search, Plus, Briefcase, Pencil, Trash2,
  ExternalLink, Lock, X, Loader2
} from 'lucide-vue-next'
import { listar, criar, atualizar, fechar as fecharVaga, deletar } from '@/api/vagas'
import { listar as listarEmpresas } from '@/api/empresas'

const vagas = ref([])
const empresas = ref([])
const carregando = ref(true)
const busca = ref('')
const salvando = ref(false)
const erro = ref('')
const modalAberto = ref(false)
const editando = ref(null)
const fecharAlvo = ref(null)
const deleteAlvo = ref(null)

const filtros = reactive({
  modeloTrabalho: '',
  tipoContrato: '',
  nivelExperiencia: '',
  vagaAindaAberta: ''
})

const temFiltro = computed(() =>
  filtros.modeloTrabalho || filtros.tipoContrato ||
  filtros.nivelExperiencia || filtros.vagaAindaAberta
)

const form = reactive({
  empresaId: '', titulo: '', modeloTrabalho: '', tipoContrato: '',
  nivelExperiencia: '', faixaSalarial: '', urlVaga: '', localizacao: '',
  requisitosObrigatorios: '', requisitosDesejaveis: '', beneficios: '', descricao: ''
})

const vagasFiltradas = computed(() => {
  let lista = vagas.value
  if (busca.value) {
    const q = busca.value.toLowerCase()
    lista = lista.filter(v =>
      v.titulo.toLowerCase().includes(q) ||
      v.empresaNome?.toLowerCase().includes(q)
    )
  }
  return lista
})

// Labels
const modeloLabel = (v) => ({ REMOTO: 'Remoto', HIBRIDO: 'Híbrido', PRESENCIAL: 'Presencial' }[v] || v)
const contratoLabel = (v) => ({ CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCE: 'Freelance' }[v] || v)
const nivelLabel = (v) => ({ ESTAGIARIO: 'Estagiário', JUNIOR: 'Júnior', PLENO: 'Pleno', SENIOR: 'Sênior', ESPECIALISTA: 'Especialista', STAFF: 'Staff' }[v] || v)
const modeloClass = (v) => ({ REMOTO: 'tag-remoto', HIBRIDO: 'tag-hibrido', PRESENCIAL: 'tag-presencial' }[v] || '')

function iniciais(nome) {
  return (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function limparFiltros() {
  Object.assign(filtros, { modeloTrabalho: '', tipoContrato: '', nivelExperiencia: '', vagaAindaAberta: '' })
}

async function carregarVagas() {
  try {
    const f = {}
    if (filtros.modeloTrabalho) f.modeloTrabalho = filtros.modeloTrabalho
    if (filtros.tipoContrato) f.tipoContrato = filtros.tipoContrato
    if (filtros.nivelExperiencia) f.nivelExperiencia = filtros.nivelExperiencia
    if (filtros.vagaAindaAberta) f.vagaAindaAberta = filtros.vagaAindaAberta
    const { data } = await listar(f)
    vagas.value = data
  } catch {
    vagas.value = []
  }
}

watch(filtros, () => carregarVagas(), { deep: true })

function abrirModal(vaga = null) {
  editando.value = vaga
  erro.value = ''
  if (vaga) {
    Object.assign(form, {
      empresaId: vaga.empresaId || '',
      titulo: vaga.titulo || '',
      modeloTrabalho: vaga.modeloTrabalho || '',
      tipoContrato: vaga.tipoContrato || '',
      nivelExperiencia: vaga.nivelExperiencia || '',
      faixaSalarial: vaga.faixaSalarial || '',
      urlVaga: vaga.urlVaga || '',
      localizacao: vaga.localizacao || '',
      requisitosObrigatorios: vaga.requisitosObrigatorios || '',
      requisitosDesejaveis: vaga.requisitosDesejaveis || '',
      beneficios: vaga.beneficios || '',
      descricao: vaga.descricao || ''
    })
  } else {
    Object.assign(form, {
      empresaId: '', titulo: '', modeloTrabalho: '', tipoContrato: '',
      nivelExperiencia: '', faixaSalarial: '', urlVaga: '', localizacao: '',
      requisitosObrigatorios: '', requisitosDesejaveis: '', beneficios: '', descricao: ''
    })
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value = null
  erro.value = ''
}

async function salvar() {
  if (!form.empresaId || !form.titulo.trim()) {
    erro.value = 'Empresa e título são obrigatórios.'
    return
  }
  salvando.value = true
  erro.value = ''
  try {
    const dados = {
      ...form,
      modeloTrabalho: form.modeloTrabalho || null,
      tipoContrato: form.tipoContrato || null,
      nivelExperiencia: form.nivelExperiencia || null
    }
    if (editando.value) {
      const { data } = await atualizar(editando.value.id, dados)
      const idx = vagas.value.findIndex(v => v.id === editando.value.id)
      if (idx !== -1) vagas.value[idx] = data
    } else {
      const { data } = await criar(dados)
      vagas.value.unshift(data)
    }
    fecharModal()
  } catch (e) {
    erro.value = e.response?.data?.mensagem || 'Erro ao salvar vaga.'
  } finally {
    salvando.value = false
  }
}

function confirmarFechar(vaga) { fecharAlvo.value = vaga }
function confirmarDelete(vaga) { deleteAlvo.value = vaga }

async function executarFechar() {
  salvando.value = true
  try {
    const { data } = await fecharVaga(fecharAlvo.value.id)
    const idx = vagas.value.findIndex(v => v.id === fecharAlvo.value.id)
    if (idx !== -1) vagas.value[idx] = data
    fecharAlvo.value = null
  } catch (e) {
    erro.value = e.response?.data?.mensagem || 'Erro ao fechar vaga.'
  } finally {
    salvando.value = false
  }
}

async function executarDelete() {
  salvando.value = true
  try {
    await deletar(deleteAlvo.value.id)
    vagas.value = vagas.value.filter(v => v.id !== deleteAlvo.value.id)
    deleteAlvo.value = null
  } catch (e) {
    erro.value = e.response?.data?.mensagem || 'Erro ao remover vaga.'
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const [vagasRes, empresasRes] = await Promise.all([listar(), listarEmpresas()])
    vagas.value = vagasRes.data
    empresas.value = empresasRes.data
  } catch {
    vagas.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.vagas-view { display: flex; flex-direction: column; gap: 20px; }

/* Barra */
.view-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 280px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #b8a898; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #EDE8E0; border-radius: 8px; background: #FAF8F5; font-size: 13px; color: #1a1208; outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: #D94518; background: #fff; }
.search-input::placeholder { color: #b8a898; }

.filtros { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.filtro-select { padding: 7px 10px; border: 1px solid #EDE8E0; border-radius: 8px; background: #FAF8F5; font-size: 12.5px; color: #6a5a4a; outline: none; cursor: pointer; }
.filtro-select:focus { border-color: #D94518; }

.btn-ghost-sm { display: flex; align-items: center; gap: 5px; padding: 7px 10px; border: 1px solid #EDE8E0; border-radius: 8px; background: none; font-size: 12px; color: #9a8878; cursor: pointer; transition: background 0.1s; }
.btn-ghost-sm:hover { background: #FAF8F5; }

.btn-primary { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #D94518; color: #fff; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; margin-left: auto; }
.btn-primary:hover:not(:disabled) { background: #BB3510; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Vazio */
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 64px 24px; gap: 10px; }
.empty-icon { width: 56px; height: 56px; border-radius: 50%; background: #EDE8E0; color: #9a8878; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
.empty-title { font-size: 15px; font-weight: 600; color: #1a1208; }
.empty-sub { font-size: 13px; color: #9a8878; line-height: 1.5; }

/* Lista */
.vagas-lista { display: flex; flex-direction: column; gap: 2px; }

.vaga-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-radius: 12px; background: #fff; border: 1px solid #EDE8E0; transition: box-shadow 0.15s, transform 0.1s; gap: 16px; }
.vaga-row:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-1px); }

.vaga-left { display: flex; align-items: flex-start; gap: 12px; flex: 1; min-width: 0; }

.vaga-avatar { width: 38px; height: 38px; border-radius: 10px; background: rgba(217,69,24,0.08); color: #D94518; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.vaga-info { flex: 1; min-width: 0; }

.vaga-titulo-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.vaga-titulo { font-size: 14px; font-weight: 700; color: #1a1208; letter-spacing: -0.01em; }

.tag-fechada { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; background: #FEF2F2; color: #DC2626; }

.vaga-empresa { font-size: 12px; color: #9a8878; margin-top: 2px; margin-bottom: 6px; }

.vaga-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.tag { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.tag-remoto { background: #F0FDF4; color: #059669; }
.tag-hibrido { background: #EFF6FF; color: #2563EB; }
.tag-presencial { background: #FEF3C7; color: #D97706; }
.tag-neutro { background: #FAF8F5; color: #6a5a4a; border: 1px solid #EDE8E0; }
.tag-salario { background: rgba(217,69,24,0.07); color: #D94518; }

.vaga-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.vaga-data { font-size: 11.5px; color: #b8a898; white-space: nowrap; }

.vaga-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
.vaga-row:hover .vaga-actions { opacity: 1; }

.icon-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: #FAF8F5; color: #9a8878; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.1s, color 0.1s; text-decoration: none; }
.icon-btn:hover { background: #EDE8E0; color: #1a1208; }
.icon-btn.danger:hover { background: #FEF2F2; color: #DC2626; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(26,18,8,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; }
.modal { background: #fff; border-radius: 18px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.15); }
.modal-sm { max-width: 420px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 24px 18px; border-bottom: 1px solid #EDE8E0; }
.modal-title { font-size: 16px; font-weight: 700; color: #1a1208; letter-spacing: -0.02em; }
.modal-form { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-body { padding: 20px 24px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 11.5px; font-weight: 600; color: #6a5a4a; letter-spacing: 0.03em; text-transform: uppercase; }
.field input, .field select, .field textarea { padding: 9px 12px; border: 1px solid #EDE8E0; border-radius: 9px; background: #FAF8F5; color: #1a1208; font-size: 13.5px; font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #D94518; background: #fff; }
.field input::placeholder, .field textarea::placeholder { color: #b8a898; }
.form-erro { font-size: 12px; color: #DC2626; padding: 8px 10px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px 20px; border-top: 1px solid #EDE8E0; }
.btn-ghost { padding: 8px 16px; background: none; border: 1px solid #EDE8E0; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: #6a5a4a; cursor: pointer; transition: background 0.1s; }
.btn-ghost:hover { background: #FAF8F5; }
.btn-danger { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #DC2626; color: #fff; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-danger:hover:not(:disabled) { background: #B91C1C; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-warning { display: flex; align-items: center; gap: 7px; padding: 8px 16px; background: #D97706; color: #fff; border: none; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-warning:hover:not(:disabled) { background: #B45309; }
.btn-warning:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-msg { font-size: 13.5px; color: #6a5a4a; line-height: 1.6; }
.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>