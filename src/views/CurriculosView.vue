<template>
  <div class="curriculos-page">

    <!-- ── Área de upload ── -->
    <div class="card upload-card">
      <h2 class="card-title">Enviar novo currículo</h2>
      <p class="card-sub">PDF de até 5&nbsp;MB. Dê um nome à versão para reconhecer depois (ex: "Backend Sênior 2026").</p>

      <div class="upload-form">
        <div class="field">
          <label>Nome da versão *</label>
          <input
            v-model.trim="versao"
            type="text"
            maxlength="100"
            placeholder="Ex: Geral, Frontend, Vaga X..."
            :disabled="enviando"
          />
        </div>

        <label
          class="dropzone"
          :class="{ 'com-arquivo': arquivo, enviando }"
          @dragover.prevent="arrastando = true"
          @dragleave.prevent="arrastando = false"
          @drop.prevent="onDrop"
          :data-arrastando="arrastando"
        >
          <input type="file" accept="application/pdf" class="file-input" @change="onSelecionar" :disabled="enviando" />
          <FileText v-if="arquivo" :size="20" class="dz-icon" />
          <UploadCloud v-else :size="20" class="dz-icon" />
          <span class="dz-texto">
            <template v-if="arquivo">{{ arquivo.name }} · {{ formatarTamanho(arquivo.size) }}</template>
            <template v-else>Arraste um PDF aqui ou clique para escolher</template>
          </span>
        </label>

        <div v-if="enviando" class="progresso">
          <div class="progresso-barra" :style="{ width: progresso + '%' }"></div>
        </div>

        <div class="upload-acoes">
          <button class="btn-primary" :disabled="!podeEnviar" @click="enviar">
            <Loader2 v-if="enviando" :size="14" class="spin" />
            {{ enviando ? `Enviando ${progresso}%` : 'Enviar currículo' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Lista de versões ── -->
    <div class="card">
      <h2 class="card-title">Minhas versões</h2>

      <div v-if="carregando" class="lista-sk">
        <div class="sk-row" v-for="n in 2" :key="n"></div>
      </div>

      <div v-else-if="curriculos.length === 0" class="empty-state">
        <div class="empty-icon"><FileText :size="22" /></div>
        <p class="empty-title">Nenhum currículo ainda</p>
        <p class="empty-sub">Envie sua primeira versão acima — ela já entra como principal.</p>
      </div>

      <TransitionGroup v-else name="lista" tag="div" class="cv-lista">
        <div v-for="cv in curriculos" :key="cv.id" class="cv-row">
          <div class="cv-icone"><FileText :size="16" /></div>
          <div class="cv-info">
            <div class="cv-topo">
              <p class="cv-versao">{{ cv.versao }}</p>
              <span v-if="cv.ehPrincipal" class="badge-principal"><Star :size="10" /> Principal</span>
            </div>
            <p class="cv-meta">{{ cv.nomeArquivo }} · {{ formatarTamanho(cv.tamanhoBytes) }} · {{ formatarData(cv.criadoEm) }}</p>
          </div>
          <div class="cv-acoes">
            <a :href="cv.urlArquivo" target="_blank" rel="noopener" class="icon-btn" title="Abrir"><ExternalLink :size="14" /></a>
            <button
              v-if="!cv.ehPrincipal"
              class="btn-marcar"
              :disabled="marcandoId === cv.id"
              @click="marcar(cv)"
            >
              <Loader2 v-if="marcandoId === cv.id" :size="12" class="spin" />
              Tornar principal
            </button>
            <button class="icon-btn danger" title="Excluir" :disabled="excluindoId === cv.id" @click="pedirExclusao(cv)">
              <Loader2 v-if="excluindoId === cv.id" :size="14" class="spin" />
              <Trash2 v-else :size="14" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Modal excluir -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="alvoExclusao" class="modal-overlay" @click.self="alvoExclusao = null">
          <div class="modal">
            <h3 class="modal-titulo">Excluir esta versão?</h3>
            <p class="modal-sub">
              A versão <strong>{{ alvoExclusao.versao }}</strong> e o arquivo serão apagados
              de forma permanente.
            </p>
            <div class="modal-acoes">
              <button class="btn-secundario" @click="alvoExclusao = null">Cancelar</button>
              <button class="btn-perigo" :disabled="excluindoId" @click="confirmarExclusao">
                <Loader2 v-if="excluindoId" :size="14" class="spin" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast'
import { listar, upload, marcarPrincipal, deletar } from '@/api/curriculos'
import { FileText, UploadCloud, Star, Trash2, ExternalLink, Loader2 } from 'lucide-vue-next'

const TAMANHO_MAX = 5 * 1024 * 1024

const toast = useToastStore()

const curriculos = ref([])
const carregando = ref(true)

const versao = ref('')
const arquivo = ref(null)
const arrastando = ref(false)
const enviando = ref(false)
const progresso = ref(0)

const marcandoId = ref(null)
const excluindoId = ref(null)
const alvoExclusao = ref(null)

const podeEnviar = computed(() => !enviando.value && arquivo.value && versao.value.trim().length > 0)

function formatarTamanho(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function validarArquivo(f) {
  if (f.type !== 'application/pdf') {
    toast.erro('Apenas arquivos PDF são aceitos.')
    return false
  }
  if (f.size > TAMANHO_MAX) {
    toast.erro('O arquivo excede o limite de 5 MB.')
    return false
  }
  return true
}

function onSelecionar(e) {
  const f = e.target.files?.[0]
  if (f && validarArquivo(f)) arquivo.value = f
  e.target.value = '' // permite reescolher o mesmo arquivo
}

function onDrop(e) {
  arrastando.value = false
  if (enviando.value) return
  const f = e.dataTransfer.files?.[0]
  if (f && validarArquivo(f)) arquivo.value = f
}

async function enviar() {
  if (!podeEnviar.value) return
  enviando.value = true
  progresso.value = 0
  try {
    const { data } = await upload(arquivo.value, versao.value.trim(), (p) => { progresso.value = p })
    curriculos.value.unshift(data)
    if (data.ehPrincipal) {
      curriculos.value.forEach(c => { if (c.id !== data.id) c.ehPrincipal = false })
    }
    arquivo.value = null
    versao.value = ''
    toast.sucesso('Currículo enviado.')
  } catch (error) {
    toast.erro(error.response?.data?.mensagem || 'Não foi possível enviar o currículo.')
  } finally {
    enviando.value = false
  }
}

async function marcar(cv) {
  marcandoId.value = cv.id
  try {
    await marcarPrincipal(cv.id)
    curriculos.value.forEach(c => { c.ehPrincipal = c.id === cv.id })
    toast.sucesso(`"${cv.versao}" agora é o principal.`)
  } catch {
    toast.erro('Não foi possível marcar como principal.')
  } finally {
    marcandoId.value = null
  }
}

function pedirExclusao(cv) { alvoExclusao.value = cv }

async function confirmarExclusao() {
  const cv = alvoExclusao.value
  if (!cv) return
  excluindoId.value = cv.id
  try {
    await deletar(cv.id)
    curriculos.value = curriculos.value.filter(c => c.id !== cv.id)
    toast.sucesso('Versão excluída.')
    alvoExclusao.value = null
  } catch {
    toast.erro('Não foi possível excluir a versão.')
  } finally {
    excluindoId.value = null
  }
}

onMounted(async () => {
  try {
    const { data } = await listar()
    curriculos.value = data
  } catch {
    curriculos.value = []
  } finally {
    carregando.value = false
  }
})
</script>

<style scoped>
.curriculos-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
}

.card {
  padding: 24px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
}

.card-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.card-sub {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 18px;
}

/* Upload */
.upload-form { display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  letter-spacing: 0.05em; text-transform: uppercase;
}
.field input {
  padding: 10px 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.field input:focus {
  border-color: var(--moss);
  background: var(--surface);
  box-shadow: 0 0 0 3px var(--moss-subtle);
}
.field input::placeholder { color: var(--text-muted); }

.dropzone {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.dropzone:hover,
.dropzone[data-arrastando="true"] {
  border-color: var(--moss);
  background: var(--moss-subtle);
  color: var(--moss);
}
.dropzone.com-arquivo { border-style: solid; border-color: var(--moss); color: var(--moss); }
.dropzone.enviando { opacity: 0.7; cursor: default; pointer-events: none; }
.dz-icon { flex-shrink: 0; }
.dz-texto { font-size: 13px; font-weight: 500; }
.file-input { display: none; }

.progresso {
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  overflow: hidden;
}
.progresso-barra {
  height: 100%;
  background: var(--moss);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.upload-acoes { display: flex; justify-content: flex-end; }

/* Lista de CVs */
.cv-lista { display: flex; flex-direction: column; gap: 10px; }

.cv-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.cv-row:hover { box-shadow: var(--shadow-sm); border-color: var(--text-muted); }

.cv-icone {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: var(--moss-subtle);
  color: var(--moss);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cv-info { flex: 1; min-width: 0; }
.cv-topo { display: flex; align-items: center; gap: 8px; }
.cv-versao {
  font-size: 13.5px; font-weight: 600; color: var(--text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.badge-principal {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
  background: var(--moss-subtle); color: var(--moss);
  flex-shrink: 0;
}
.cv-meta { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

.cv-acoes { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.btn-marcar {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.btn-marcar:hover:not(:disabled) { border-color: var(--moss); color: var(--moss); }
.btn-marcar:disabled { opacity: 0.6; cursor: not-allowed; }

.icon-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.icon-btn:hover { background: var(--surface-alt); color: var(--text-primary); }
.icon-btn.danger:hover { background: var(--danger-subtle); color: var(--danger); border-color: var(--danger-subtle); }
.icon-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Empty + skeleton */
.empty-state {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 40px 24px; gap: 8px;
}
.empty-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--surface-alt); color: var(--text-muted);
  display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
}
.empty-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.empty-sub { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

.lista-sk { display: flex; flex-direction: column; gap: 10px; }
.sk-row { height: 68px; border-radius: 12px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-row::after {
  content: ''; position: absolute; inset: 0; transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }

/* Botões gerais */
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border: none; border-radius: 10px;
  background: var(--moss); color: var(--text-inverse);
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: var(--moss-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secundario {
  padding: 10px 16px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--surface-alt); color: var(--text-secondary);
  font-size: 13px; font-weight: 700; cursor: pointer;
}
.btn-secundario:hover { border-color: var(--text-muted); }

.btn-perigo {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border: none; border-radius: 10px;
  background: var(--danger); color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: filter 0.15s;
}
.btn-perigo:hover:not(:disabled) { filter: brightness(0.95); }
.btn-perigo:disabled { opacity: 0.6; cursor: not-allowed; }

/* Transições de lista */
.lista-enter-active, .lista-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.lista-enter-from { opacity: 0; transform: translateY(-6px); }
.lista-leave-to { opacity: 0; transform: translateX(12px); }
.lista-move { transition: transform 0.25s ease; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(20, 24, 20, 0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 50; padding: 24px;
}
.modal {
  width: 100%; max-width: 400px; padding: 28px;
  border-radius: 16px; background: var(--surface); border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.modal-titulo {
  font-family: var(--font-display); font-size: 18px; font-weight: 600;
  color: var(--text-primary); margin-bottom: 8px;
}
.modal-sub { font-size: 13px; color: var(--text-muted); line-height: 1.6; }
.modal-acoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
