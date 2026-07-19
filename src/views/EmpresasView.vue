<template>
  <div class="empresas-view">

    <div class="view-bar">
      <div class="search-wrap">
        <Search :size="13" class="search-icon" />
        <input v-model="busca" type="text" placeholder="Buscar empresa..." class="search-input" />
      </div>
      <span class="contador">{{ empresas.length }} no catálogo</span>
      <button class="btn-primary" @click="abrirModal()">
        <Plus :size="14" /> Adicionar empresa
      </button>
    </div>

    <!-- Skeleton -->
    <div v-if="carregando" class="grid">
      <div v-for="n in 6" :key="n" class="sk-card"></div>
    </div>

    <!-- Vazio -->
    <div v-else-if="empresasFiltradas.length === 0 && !busca" class="empty-state">
      <div class="empty-icon"><Building2 :size="22" /></div>
      <p class="empty-title">Nenhuma empresa no catálogo</p>
      <p class="empty-sub">Cadastre as empresas que te interessam — depois é só vincular vagas a elas.</p>
      <button class="btn-primary" @click="abrirModal()"><Plus :size="13" /> Adicionar empresa</button>
    </div>

    <div v-else-if="empresasFiltradas.length === 0" class="empty-state">
      <p class="empty-sub">Nenhuma empresa encontrada para "{{ busca }}".</p>
    </div>

    <!-- Grid de cards -->
    <TransitionGroup v-else name="lista" tag="div" class="grid">
      <div v-for="e in empresasFiltradas" :key="e.id" class="empresa-card">
        <div class="card-top">
          <div class="empresa-avatar">{{ iniciais(e.nome) }}</div>
          <div class="empresa-actions">
            <a v-if="e.site" :href="normalizarUrl(e.site)" target="_blank" rel="noopener" class="icon-btn" title="Abrir site"><ExternalLink :size="12" /></a>
            <button class="icon-btn" @click="abrirModal(e)" title="Editar"><Pencil :size="12" /></button>
            <button class="icon-btn danger" @click="alvoDelete = e" title="Remover"><Trash2 :size="12" /></button>
          </div>
        </div>
        <div class="card-body">
          <div class="empresa-titulo-row">
            <h3 class="empresa-nome">{{ e.nome }}</h3>
            <span v-if="e.porte" class="tag tag-neutro">{{ porteLabel(e.porte) }}</span>
          </div>
          <p class="empresa-meta">
            <span v-if="e.setor">{{ e.setor }}</span>
            <span v-if="e.setor && e.localizacao"> · </span>
            <span v-if="e.localizacao">{{ e.localizacao }}</span>
            <span v-if="!e.setor && !e.localizacao" class="sem-meta">Sem detalhes ainda</span>
          </p>
          <p v-if="e.culturaObservacoes" class="empresa-cultura">{{ e.culturaObservacoes }}</p>
        </div>
      </div>
    </TransitionGroup>

    <!-- Modal criar/editar -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
          <div class="modal">
            <div class="modal-header">
              <h3 class="modal-title">{{ editando ? 'Editar empresa' : 'Adicionar empresa' }}</h3>
              <button class="icon-btn" @click="fecharModal"><X :size="15" /></button>
            </div>
            <form class="modal-form" @submit.prevent="salvar">
              <div class="field">
                <label>Nome *</label>
                <input
                  v-model.trim="form.nome" type="text" maxlength="255" placeholder="Nome da empresa"
                  :class="{ 'input-erro': erroNome }" @input="tentou && validar()"
                />
                <span v-if="erroNome" class="campo-erro">{{ erroNome }}</span>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Setor</label>
                  <input v-model.trim="form.setor" type="text" placeholder="Ex: Fintech" />
                </div>
                <div class="field">
                  <label>Porte</label>
                  <select v-model="form.porte">
                    <option :value="null">Não informar</option>
                    <option v-for="p in PORTES" :key="p.valor" :value="p.valor">{{ p.label }}</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Localização</label>
                  <input v-model.trim="form.localizacao" type="text" placeholder="Ex: São Paulo, SP" />
                </div>
                <div class="field">
                  <label>Site</label>
                  <input v-model.trim="form.site" type="text" maxlength="500" placeholder="empresa.com" />
                </div>
              </div>
              <div class="field">
                <label>Observações de cultura</label>
                <textarea v-model="form.culturaObservacoes" rows="2" placeholder="O que você sabe sobre o jeito de trabalhar daqui..."></textarea>
              </div>
              <div class="form-row">
                <div class="field">
                  <label>Contato RH</label>
                  <input v-model.trim="form.contatoRh" type="text" placeholder="Nome ou email" />
                </div>
                <div class="field">
                  <label>Contato de referência</label>
                  <input v-model.trim="form.contatoReferencia" type="text" placeholder="Alguém que você conhece" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn-ghost" @click="fecharModal">Cancelar</button>
                <button type="submit" class="btn-primary" :disabled="salvando">
                  <Loader2 v-if="salvando" :size="13" class="spin" />
                  {{ salvando ? 'Salvando...' : editando ? 'Salvar' : 'Salvar empresa' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal delete -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="alvoDelete" class="modal-overlay" @click.self="alvoDelete = null">
          <div class="modal modal-sm">
            <div class="modal-header">
              <h3 class="modal-title">Remover empresa</h3>
              <button class="icon-btn" @click="alvoDelete = null"><X :size="15" /></button>
            </div>
            <div class="modal-body">
              <p class="delete-msg">Remover <strong>{{ alvoDelete.nome }}</strong>? Vagas vinculadas a ela impedem a remoção.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost" @click="alvoDelete = null">Cancelar</button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Building2, Pencil, Trash2, ExternalLink, X, Loader2 } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import { listar, criar, atualizar, deletar } from '@/api/empresas'

const toast = useToastStore()

const PORTES = [
  { valor: 'STARTUP', label: 'Startup' },
  { valor: 'PEQUENA', label: 'Pequena' },
  { valor: 'MEDIA', label: 'Média' },
  { valor: 'GRANDE', label: 'Grande' },
  { valor: 'MULTINACIONAL', label: 'Multinacional' }
]

const empresas = ref([])
const carregando = ref(true)
const busca = ref('')
const salvando = ref(false)
const modalAberto = ref(false)
const editando = ref(null)
const alvoDelete = ref(null)
const tentou = ref(false)
const erroNome = ref('')

function formVazio() {
  return {
    nome: '', site: '', localizacao: '', porte: null,
    setor: '', culturaObservacoes: '', contatoRh: '', contatoReferencia: ''
  }
}
const form = reactive(formVazio())

const empresasFiltradas = computed(() => {
  if (!busca.value) return empresas.value
  const q = busca.value.toLowerCase()
  return empresas.value.filter(e =>
    e.nome?.toLowerCase().includes(q) ||
    e.setor?.toLowerCase().includes(q) ||
    e.localizacao?.toLowerCase().includes(q))
})

const porteLabel = (v) => PORTES.find(p => p.valor === v)?.label || v
function iniciais(nome) { return (nome || '').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() }
function normalizarUrl(u) { return /^https?:\/\//i.test(u) ? u : `https://${u}` }

function validar() {
  erroNome.value = form.nome?.trim() ? '' : 'Informe o nome da empresa.'
  return !erroNome.value
}

function abrirModal(empresa = null) {
  editando.value = empresa
  tentou.value = false
  erroNome.value = ''
  if (empresa) {
    Object.assign(form, {
      nome: empresa.nome ?? '', site: empresa.site ?? '', localizacao: empresa.localizacao ?? '',
      porte: empresa.porte ?? null, setor: empresa.setor ?? '',
      culturaObservacoes: empresa.culturaObservacoes ?? '',
      contatoRh: empresa.contatoRh ?? '', contatoReferencia: empresa.contatoReferencia ?? ''
    })
  } else {
    Object.assign(form, formVazio())
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value = null
  erroNome.value = ''
  tentou.value = false
}

function payload() {
  return {
    nome: form.nome.trim(),
    site: form.site || null,
    localizacao: form.localizacao || null,
    porte: form.porte,
    setor: form.setor || null,
    culturaObservacoes: form.culturaObservacoes || null,
    contatoRh: form.contatoRh || null,
    contatoReferencia: form.contatoReferencia || null
  }
}

async function salvar() {
  tentou.value = true
  if (!validar()) return
  salvando.value = true
  try {
    if (editando.value) {
      const { data } = await atualizar(editando.value.id, payload())
      const idx = empresas.value.findIndex(e => e.id === editando.value.id)
      if (idx !== -1) empresas.value[idx] = data
      toast.sucesso('Empresa atualizada.')
    } else {
      const { data } = await criar(payload())
      empresas.value.unshift(data)
      toast.sucesso('Empresa adicionada.')
    }
    fecharModal()
  } catch (e) {
    toast.erro(e.response?.data?.mensagem || 'Não foi possível salvar a empresa.')
  } finally {
    salvando.value = false
  }
}

async function executarDelete() {
  salvando.value = true
  try {
    await deletar(alvoDelete.value.id)
    empresas.value = empresas.value.filter(e => e.id !== alvoDelete.value.id)
    toast.sucesso('Empresa removida.')
    alvoDelete.value = null
  } catch (e) {
    toast.erro(e.response?.data?.mensagem || 'Não foi possível remover a empresa.')
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await listar()
    empresas.value = data
  } catch {
    empresas.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.empresas-view { display: flex; flex-direction: column; gap: var(--sp-4); }

/* Bar */
.view-bar { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 280px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input { width: 100%; padding: 9px 14px 9px 32px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); font-size: 13px; color: var(--text-primary); outline: none; transition: border-color 0.15s; }
.search-input:focus { border-color: var(--moss); }
.search-input::placeholder { color: var(--text-muted); }
.contador { font-size: 12px; color: var(--text-muted); white-space: nowrap; }

.btn-primary { display: flex; align-items: center; gap: var(--sp-2); padding: 9px var(--sp-4); background: var(--moss); color: var(--text-inverse); border: none; border-radius: var(--radius-md); font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.1s; white-space: nowrap; margin-left: auto; }
.btn-primary:hover:not(:disabled) { background: var(--moss-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; text-align: center; padding: var(--sp-16) var(--sp-6); gap: var(--sp-2); }
.empty-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; margin-bottom: var(--sp-1); }
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

/* Grid de cards */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }

.empresa-card { display: flex; flex-direction: column; gap: 14px; padding: 18px 20px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); transition: box-shadow 0.18s ease, transform 0.12s ease, border-color 0.15s; }
.empresa-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); border-color: var(--border-subtle); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; }
.empresa-avatar { width: 40px; height: 40px; border-radius: 11px; background: var(--moss-subtle); color: var(--moss); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.empresa-actions { display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
.empresa-card:hover .empresa-actions,
.empresa-card:focus-within .empresa-actions { opacity: 1; }

.card-body { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.empresa-titulo-row { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: wrap; }
.empresa-nome { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; text-wrap: balance; }
.empresa-meta { font-size: 12px; color: var(--text-muted); }
.sem-meta { font-style: italic; opacity: 0.8; }
.empresa-cultura { font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-top: 3px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.tag { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px; }
.tag-neutro { background: var(--surface-alt); color: var(--text-secondary); }

.icon-btn { width: 26px; height: 26px; border-radius: var(--radius-sm); border: none; background: var(--surface-alt); color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.1s, color 0.1s; text-decoration: none; }
.icon-btn:hover { background: var(--border); color: var(--text-primary); }
.icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); }

/* Skeleton */
.sk-card { height: 132px; border-radius: 16px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-card::after { content: ''; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent); animation: shimmer 1.3s infinite; }
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(32,36,30,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--sp-6); }
.modal { background: var(--surface); border-radius: 18px; width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-xl); border: 1px solid var(--border); }
.modal-sm { max-width: 400px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4) var(--sp-6); border-bottom: 1px solid var(--border); }
.modal-title { font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.modal-form { padding: var(--sp-4) var(--sp-6); display: flex; flex-direction: column; gap: var(--sp-3); }
.modal-body { padding: var(--sp-4) var(--sp-6); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-3); }
.field { display: flex; flex-direction: column; gap: var(--sp-1); }
.field label { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; }
.field input, .field select, .field textarea { padding: 8px var(--sp-3); border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-alt); color: var(--text-primary); font-size: 13.5px; font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: var(--moss); background: var(--surface); box-shadow: 0 0 0 3px var(--moss-subtle); }
.field input::placeholder, .field textarea::placeholder { color: var(--text-muted); }
.input-erro, .input-erro:focus { border-color: var(--danger); box-shadow: 0 0 0 3px var(--danger-subtle); }
.campo-erro { font-size: 11.5px; color: var(--danger); }

.modal-footer { display: flex; justify-content: flex-end; gap: var(--sp-2); padding: var(--sp-3) var(--sp-6) var(--sp-4); border-top: 1px solid var(--border); }
.btn-ghost { padding: 7px var(--sp-4); background: none; border: 1px solid var(--border); border-radius: var(--radius); font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; }
.btn-ghost:hover { background: var(--surface-alt); }
.btn-danger { display: flex; align-items: center; gap: var(--sp-2); padding: 7px var(--sp-4); background: var(--danger); color: #fff; border: none; border-radius: var(--radius); font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-danger:hover:not(:disabled) { opacity: 0.88; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.delete-msg { font-size: 13.5px; color: var(--text-secondary); line-height: 1.6; }

/* Transições */
.lista-enter-active, .lista-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.lista-enter-from { opacity: 0; transform: translateY(-6px); }
.lista-leave-to { opacity: 0; transform: translateX(12px); }
.lista-move { transition: transform 0.25s ease; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
