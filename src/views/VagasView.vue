<template>
  <div class="vagas-view">

    <div class="view-bar">
      <div class="search-wrap">
        <Search :size="13" class="search-icon" />
        <input v-model="busca" type="text" placeholder="Buscar vaga ou empresa..." class="search-input" />
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
          <option value="false">Encerradas</option>
        </select>
        <button v-if="temFiltro" class="btn-ghost-sm" @click="limparFiltros">
          <X :size="12" /> Limpar
        </button>
      </div>
      <span class="contador-salvas">{{ vagas.length }} salvas</span>
      <button class="btn-primary" @click="abrirModal()">
        <Plus :size="14" /> Adicionar vaga
      </button>
    </div>

    <div v-if="carregando" class="grid">
      <div v-for="n in 6" :key="n" class="sk-card"></div>
    </div>

    <div v-else-if="vagasFiltradas.length === 0 && !busca && !temFiltro" class="empty-state">
      <div class="empty-icon"><Briefcase :size="22" /></div>
      <p class="empty-title">Nenhuma vaga cadastrada</p>
      <p class="empty-sub">Cadastre vagas de interesse e vincule a empresas do seu catálogo.</p>
      <button class="btn-primary" @click="abrirModal()"><Plus :size="13" /> Adicionar vaga</button>
    </div>

    <div v-else-if="vagasFiltradas.length === 0" class="empty-state">
      <p class="empty-sub">Nenhuma vaga encontrada com os filtros aplicados.</p>
    </div>

    <TransitionGroup v-else name="lista" tag="div" class="grid">
      <div v-for="vaga in vagasFiltradas" :key="vaga.id" class="vaga-card" :class="{ encerrada: !vaga.vagaAindaAberta }">
        <div class="card-top">
          <div class="vaga-avatar">{{ iniciais(vaga.empresaNome) }}</div>
          <div class="vaga-actions">
            <a v-if="vaga.urlVaga" :href="vaga.urlVaga" target="_blank" rel="noopener" class="icon-btn" title="Ver vaga"><ExternalLink :size="12" /></a>
            <button class="icon-btn" @click="abrirModal(vaga)" title="Editar"><Pencil :size="12" /></button>
            <button v-if="vaga.vagaAindaAberta" class="icon-btn" @click="confirmarFechar(vaga)" title="Fechar vaga"><Lock :size="12" /></button>
            <button class="icon-btn danger" @click="confirmarDelete(vaga)" title="Remover"><Trash2 :size="12" /></button>
          </div>
        </div>

        <div class="card-body">
          <div class="vaga-titulo-row">
            <h3 class="vaga-titulo">{{ vaga.titulo }}</h3>
            <span v-if="!vaga.vagaAindaAberta" class="tag-fechada">Encerrada</span>
          </div>
          <p class="vaga-empresa">{{ vaga.empresaNome }}</p>
          <div class="vaga-tags">
            <span v-if="vaga.modeloTrabalho" class="tag" :class="modeloClass(vaga.modeloTrabalho)">{{ modeloLabel(vaga.modeloTrabalho) }}</span>
            <span v-if="vaga.tipoContrato" class="tag tag-neutro">{{ contratoLabel(vaga.tipoContrato) }}</span>
            <span v-if="vaga.nivelExperiencia" class="tag tag-neutro">{{ nivelLabel(vaga.nivelExperiencia) }}</span>
            <span v-if="vaga.faixaSalarial" class="tag tag-salario">{{ vaga.faixaSalarial }}</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="vaga-data">Salva {{ formatarData(vaga.criadoEm) }}</span>
        </div>
      </div>
    </TransitionGroup>

    <!-- Modal criar/editar -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">{{ editando ? 'Editar vaga' : 'Adicionar vaga' }}</h3>
            <button class="icon-btn" @click="fecharModal"><X :size="15" /></button>
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
                <Loader2 v-if="salvando" :size="13" class="spin" />
                {{ salvando ? 'Salvando...' : editando ? 'Salvar' : 'Salvar vaga' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal fechar vaga -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="fecharAlvo" class="modal-overlay" @click.self="fecharAlvo = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Fechar vaga</h3>
            <button class="icon-btn" @click="fecharAlvo = null"><X :size="15" /></button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">Marcar <strong>{{ fecharAlvo.titulo }}</strong> como fechada? Não será possível criar novas candidaturas para ela.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="fecharAlvo = null">Cancelar</button>
            <button class="btn-warning" @click="executarFechar" :disabled="salvando">
              <Loader2 v-if="salvando" :size="13" class="spin" />
              {{ salvando ? 'Fechando...' : 'Fechar vaga' }}
            </button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- Modal delete -->
    <Teleport to="body">
      <Transition name="modal">
      <div v-if="deleteAlvo" class="modal-overlay" @click.self="deleteAlvo = null">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3 class="modal-title">Remover vaga</h3>
            <button class="icon-btn" @click="deleteAlvo = null"><X :size="15" /></button>
          </div>
          <div class="modal-body">
            <p class="delete-msg">Remover <strong>{{ deleteAlvo.titulo }}</strong>? Candidaturas ativas vinculadas a ela não poderão ser removidas.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" @click="deleteAlvo = null">Cancelar</button>
            <button class="btn-danger" @click="executarDelete" :disabled="salvando">
              <Loader2 v-if="salvando" :size="13" class="spin" />
              {{ salvando ? 'Removendo...' : 'Remover' }}
            </button>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { Search, Plus, Briefcase, Pencil, Trash2, ExternalLink, Lock, X, Loader2 } from 'lucide-vue-next'
import { listar, criar, atualizar, fechar as fecharVaga, deletar } from '@/api/vagas'
import { listar as listarEmpresas } from '@/api/empresas'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

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

const filtros = reactive({ modeloTrabalho: '', tipoContrato: '', nivelExperiencia: '', vagaAindaAberta: '' })
const temFiltro = computed(() => filtros.modeloTrabalho || filtros.tipoContrato || filtros.nivelExperiencia || filtros.vagaAindaAberta)

const form = reactive({
  empresaId: '', titulo: '', modeloTrabalho: '', tipoContrato: '',
  nivelExperiencia: '', faixaSalarial: '', urlVaga: '', localizacao: '',
  requisitosObrigatorios: '', requisitosDesejaveis: '', beneficios: '', descricao: ''
})

const vagasFiltradas = computed(() => {
  if (!busca.value) return vagas.value
  const q = busca.value.toLowerCase()
  return vagas.value.filter(v => v.titulo.toLowerCase().includes(q) || v.empresaNome?.toLowerCase().includes(q))
})

const modeloLabel = (v) => ({ REMOTO: 'Remoto', HIBRIDO: 'Híbrido', PRESENCIAL: 'Presencial' }[v] || v)
const contratoLabel = (v) => ({ CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio', TEMPORARIO: 'Temporário', FREELANCE: 'Freelance' }[v] || v)
const nivelLabel = (v) => ({ ESTAGIARIO: 'Estagiário', JUNIOR: 'Júnior', PLENO: 'Pleno', SENIOR: 'Sênior', ESPECIALISTA: 'Especialista', STAFF: 'Staff' }[v] || v)
const modeloClass = (v) => ({ REMOTO: 'tag-remoto', HIBRIDO: 'tag-hibrido', PRESENCIAL: 'tag-presencial' }[v] || '')

function iniciais(nome) { return (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }
function formatarData(data) { if (!data) return ''; return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) }
function limparFiltros() { Object.assign(filtros, { modeloTrabalho: '', tipoContrato: '', nivelExperiencia: '', vagaAindaAberta: '' }) }

async function carregarVagas() {
  try {
    const f = {}
    if (filtros.modeloTrabalho) f.modeloTrabalho = filtros.modeloTrabalho
    if (filtros.tipoContrato) f.tipoContrato = filtros.tipoContrato
    if (filtros.nivelExperiencia) f.nivelExperiencia = filtros.nivelExperiencia
    if (filtros.vagaAindaAberta) f.vagaAindaAberta = filtros.vagaAindaAberta
    const { data } = await listar(f)
    vagas.value = data
  } catch { vagas.value = [] }
}

watch(filtros, () => carregarVagas(), { deep: true })

function abrirModal(vaga = null) {
  editando.value = vaga
  erro.value = ''
  if (vaga) {
    Object.assign(form, { empresaId: vaga.empresaId || '', titulo: vaga.titulo || '', modeloTrabalho: vaga.modeloTrabalho || '', tipoContrato: vaga.tipoContrato || '', nivelExperiencia: vaga.nivelExperiencia || '', faixaSalarial: vaga.faixaSalarial || '', urlVaga: vaga.urlVaga || '', localizacao: vaga.localizacao || '', requisitosObrigatorios: vaga.requisitosObrigatorios || '', requisitosDesejaveis: vaga.requisitosDesejaveis || '', beneficios: vaga.beneficios || '', descricao: vaga.descricao || '' })
  } else {
    Object.assign(form, { empresaId: '', titulo: '', modeloTrabalho: '', tipoContrato: '', nivelExperiencia: '', faixaSalarial: '', urlVaga: '', localizacao: '', requisitosObrigatorios: '', requisitosDesejaveis: '', beneficios: '', descricao: '' })
  }
  modalAberto.value = true
}

function fecharModal() { modalAberto.value = false; editando.value = null; erro.value = '' }

async function salvar() {
  if (!form.empresaId || !form.titulo.trim()) { erro.value = 'Empresa e título são obrigatórios.'; return }
  salvando.value = true; erro.value = ''
  try {
    const dados = { ...form, modeloTrabalho: form.modeloTrabalho || null, tipoContrato: form.tipoContrato || null, nivelExperiencia: form.nivelExperiencia || null }
    if (editando.value) {
      const { data } = await atualizar(editando.value.id, dados)
      const idx = vagas.value.findIndex(v => v.id === editando.value.id)
      if (idx !== -1) vagas.value[idx] = data
      toast.sucesso('Vaga atualizada.')
    } else {
      const { data } = await criar(dados)
      vagas.value.unshift(data)
      toast.sucesso('Vaga adicionada.')
    }
    fecharModal()
  } catch (e) { erro.value = e.response?.data?.mensagem || 'Erro ao salvar vaga.' } finally { salvando.value = false }
}

function confirmarFechar(vaga) { fecharAlvo.value = vaga }
function confirmarDelete(vaga) { deleteAlvo.value = vaga }

async function executarFechar() {
  salvando.value = true
  try {
    const { data } = await fecharVaga(fecharAlvo.value.id)
    const idx = vagas.value.findIndex(v => v.id === fecharAlvo.value.id)
    if (idx !== -1) vagas.value[idx] = data
    toast.sucesso('Vaga marcada como encerrada.')
    fecharAlvo.value = null
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível fechar a vaga.') } finally { salvando.value = false }
}

async function executarDelete() {
  salvando.value = true
  try {
    await deletar(deleteAlvo.value.id)
    vagas.value = vagas.value.filter(v => v.id !== deleteAlvo.value.id)
    toast.sucesso('Vaga removida.')
    deleteAlvo.value = null
  } catch (e) { toast.erro(e.response?.data?.mensagem || 'Não foi possível remover a vaga.') } finally { salvando.value = false }
}

onMounted(async () => {
  try {
    const [vagasRes, empresasRes] = await Promise.all([listar(), listarEmpresas()])
    vagas.value = vagasRes.data
    empresas.value = empresasRes.data
  } catch { vagas.value = [] } finally { carregando.value = false }
})
</script>

<style scoped>
.vagas-view { display: flex; flex-direction: column; gap: var(--sp-4); }

/* Bar */
.view-bar { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 260px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 9px 14px 9px 32px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); font-size: 13px; color: var(--text-primary); outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: var(--moss); }
.search-input::placeholder { color: var(--text-muted); }

.filtros { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.filtro-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); font-size: 12.5px; color: var(--text-secondary); outline: none; cursor: pointer; }
.filtro-select:focus { border-color: var(--moss); }

.btn-ghost-sm { display: flex; align-items: center; gap: var(--sp-1); padding: 6px 10px; border: 1px solid var(--border); border-radius: var(--radius); background: none; font-size: 12px; color: var(--text-muted); cursor: pointer; }
.btn-ghost-sm:hover { background: var(--surface-alt); }

.contador-salvas { font-size: 12px; color: var(--text-muted); margin-left: 6px; white-space: nowrap; }

.btn-primary { display: flex; align-items: center; gap: var(--sp-2); padding: 9px var(--sp-4); background: var(--moss); color: var(--text-inverse); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; margin-left: auto; }
.btn-primary:hover:not(:disabled) { background: var(--moss-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--sp-16) var(--sp-6); gap: var(--sp-2); }
.empty-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

/* Grid de cards */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.vaga-card { display: flex; flex-direction: column; gap: 12px; padding: 18px 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: box-shadow 0.18s ease, transform 0.12s ease, border-color 0.15s; }
.vaga-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--border-subtle); }
.vaga-card.encerrada { opacity: 0.72; }
.vaga-card.encerrada:hover { opacity: 1; }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; }
.vaga-avatar { width: 40px; height: 40px; border-radius: 11px; background: var(--moss-subtle); color: var(--moss); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.vaga-actions { display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
.vaga-card:hover .vaga-actions,
.vaga-card:focus-within .vaga-actions { opacity: 1; }

.card-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.vaga-titulo-row { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.vaga-titulo { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; text-wrap: balance; }
.tag-fechada { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; background: var(--danger-subtle); color: var(--danger); }
.vaga-empresa { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.vaga-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px; }
.tag-remoto   { background: var(--success-subtle); color: var(--success); }
.tag-hibrido  { background: var(--info-subtle); color: var(--info); }
.tag-presencial { background: var(--warning-subtle); color: var(--warning); }
.tag-neutro   { background: var(--surface-alt); color: var(--text-secondary); }
.tag-salario  { background: var(--clay-subtle); color: var(--clay); }

.card-footer { display: flex; align-items: center; justify-content: flex-end; padding-top: 4px; border-top: 1px solid var(--border-subtle); }
.vaga-data { font-size: 11.5px; color: var(--text-muted); white-space: nowrap; }

.icon-btn { width: 26px; height: 26px; border-radius: var(--radius-sm); border: none; background: var(--surface-alt); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.1s, color 0.1s; text-decoration: none; }
.icon-btn:hover { background: var(--border); color: var(--text-primary); }
.icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(32,36,30,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--sp-6); }
.modal { background: var(--surface); border-radius: 18px; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-xl); border: 1px solid var(--border); }
.modal-sm { max-width: 400px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4) var(--sp-6) var(--sp-4); border-bottom: 1px solid var(--border); }
.modal-title { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.modal-form { padding: var(--sp-4) var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-3); }
.modal-body { padding: var(--sp-4) var(--sp-6); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.field { display: flex; flex-direction: column; gap: var(--sp-1); }
.field label { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
.field input, .field select, .field textarea { padding: 8px var(--sp-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-alt); color: var(--text-primary); font-size: 13.5px; font-family: inherit; outline: none; transition: border-color 0.15s; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--moss); background: var(--surface); }
.field input::placeholder, .field textarea::placeholder { color: var(--text-muted); }
.form-erro { font-size: 12px; color: var(--danger); padding: var(--sp-2) var(--sp-3); background: var(--danger-subtle); border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent); border-radius: var(--radius); }
.modal-footer { display: flex; justify-content: flex-end; gap: var(--sp-2); padding: var(--sp-3) var(--sp-6) var(--sp-4); border-top: 1px solid var(--border); }
.btn-ghost { padding: 7px var(--sp-4); background: none; border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; }
.btn-ghost:hover { background: var(--surface-alt); }
.btn-danger { display: flex; align-items: center; gap: var(--sp-2); padding: 7px var(--sp-4); background: var(--danger); color: #fff; border: none; border-radius: var(--radius); font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-danger:hover:not(:disabled) { opacity: 0.88; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-warning { display: flex; align-items: center; gap: var(--sp-2); padding: 7px var(--sp-4); background: var(--warning); color: #fff; border: none; border-radius: var(--radius); font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-warning:hover:not(:disabled) { opacity: 0.88; }
.btn-warning:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-msg { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; }

/* Skeleton */
.sk-card { height: 150px; border-radius: 16px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-card::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimmer 1.3s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* Transições de lista */
.lista-enter-active, .lista-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.lista-enter-from { opacity: 0; transform: translateY(-6px); }
.lista-leave-to { opacity: 0; transform: translateX(12px); }
.lista-move { transition: transform 0.25s ease; }

/* Transições de modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>