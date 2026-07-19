<template>
  <div class="perfil-page">

    <!-- ── Formulário do perfil ── -->
    <form class="card" @submit.prevent="handleSalvar">
      <h2 class="card-title">Identidade profissional</h2>
      <p class="card-sub">É isso que descreve você nas candidaturas. Preencha com calma.</p>

      <div v-if="carregando" class="form-skeleton">
        <div class="sk-line" v-for="n in 5" :key="n"></div>
      </div>

      <template v-else>
        <div class="grupo">
          <div class="field">
            <label>Nome completo *</label>
            <input
              v-model.trim="form.nomeCompleto"
              type="text"
              placeholder="Como você assina profissionalmente"
              :class="{ 'input-erro': erros.nomeCompleto }"
              @input="revalidar"
            />
            <span v-if="erros.nomeCompleto" class="campo-erro">{{ erros.nomeCompleto }}</span>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Telefone</label>
              <input v-model.trim="form.telefone" type="text" maxlength="20" placeholder="(11) 90000-0000" />
            </div>
            <div class="field">
              <label>Cidade</label>
              <input v-model.trim="form.cidade" type="text" maxlength="100" placeholder="São Paulo" />
            </div>
            <div class="field field-uf">
              <label>UF</label>
              <input
                v-model.trim="form.estado"
                type="text"
                maxlength="2"
                placeholder="SP"
                style="text-transform: uppercase"
                :class="{ 'input-erro': erros.estado }"
                @input="revalidar"
              />
              <span v-if="erros.estado" class="campo-erro">{{ erros.estado }}</span>
            </div>
          </div>
        </div>

        <div class="grupo">
          <p class="grupo-titulo">Carreira</p>
          <div class="form-row">
            <div class="field">
              <label>Nível de experiência</label>
              <select v-model="form.nivelExperiencia">
                <option :value="null">Não informar</option>
                <option v-for="n in NIVEIS" :key="n.valor" :value="n.valor">{{ n.label }}</option>
              </select>
            </div>
            <div class="field">
              <label>Disponibilidade</label>
              <select v-model="form.disponibilidade">
                <option :value="null">Não informar</option>
                <option v-for="d in DISPONIBILIDADES" :key="d.valor" :value="d.valor">{{ d.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="field">
              <label>Pretensão mínima (R$)</label>
              <input
                v-model="form.pretensaoSalarialMin"
                type="number" min="0" step="100"
                placeholder="Ex: 6000"
                :class="{ 'input-erro': erros.pretensao }"
                @input="revalidar"
              />
            </div>
            <div class="field">
              <label>Pretensão máxima (R$)</label>
              <input
                v-model="form.pretensaoSalarialMax"
                type="number" min="0" step="100"
                placeholder="Ex: 9000"
                :class="{ 'input-erro': erros.pretensao }"
                @input="revalidar"
              />
            </div>
          </div>
          <span v-if="erros.pretensao" class="campo-erro campo-erro--bloco">{{ erros.pretensao }}</span>
        </div>

        <div class="grupo">
          <p class="grupo-titulo">Modelo de trabalho que aceito</p>
          <div class="chips">
            <label class="chip" :class="{ ativo: form.aceitaRemoto }">
              <input type="checkbox" v-model="form.aceitaRemoto" />
              Remoto
            </label>
            <label class="chip" :class="{ ativo: form.aceitaHibrido }">
              <input type="checkbox" v-model="form.aceitaHibrido" />
              Híbrido
            </label>
            <label class="chip" :class="{ ativo: form.aceitaPresencial }">
              <input type="checkbox" v-model="form.aceitaPresencial" />
              Presencial
            </label>
          </div>
        </div>

        <div class="grupo">
          <p class="grupo-titulo">Links</p>
          <div class="field">
            <label>LinkedIn</label>
            <input
              v-model.trim="form.urlLinkedin" type="text" maxlength="255"
              placeholder="linkedin.com/in/voce"
              :class="{ 'input-erro': erros.urlLinkedin }" @input="revalidar"
            />
            <span v-if="erros.urlLinkedin" class="campo-erro">{{ erros.urlLinkedin }}</span>
          </div>
          <div class="form-row">
            <div class="field">
              <label>GitHub</label>
              <input v-model.trim="form.urlGithub" type="text" maxlength="255" placeholder="github.com/voce" />
            </div>
            <div class="field">
              <label>Portfólio</label>
              <input v-model.trim="form.urlPortfolio" type="text" maxlength="255" placeholder="seusite.com" />
            </div>
          </div>
        </div>

        <div class="grupo">
          <p class="grupo-titulo">Resumo profissional</p>
          <div class="field">
            <textarea
              v-model="form.resumoProfissional"
              rows="4" maxlength="500"
              placeholder="Duas ou três frases sobre o que você faz e o que procura."
            ></textarea>
            <span class="contador">{{ (form.resumoProfissional || '').length }}/500</span>
          </div>
        </div>

        <div class="form-acoes">
          <button type="submit" class="btn-primary" :disabled="salvando">
            <Loader2 v-if="salvando" :size="14" class="spin" />
            {{ salvando ? 'Salvando...' : 'Salvar perfil' }}
          </button>
        </div>
      </template>
    </form>

    <!-- ── Meus dados (LGPD) ── -->
    <div class="card">
      <h2 class="card-title">Meus dados</h2>
      <p class="card-sub">
        Baixe uma cópia de tudo que está guardado na sua conta — perfil, empresas,
        vagas, candidaturas, histórico e contatos, em planilhas CSV.
      </p>
      <button class="btn-secundario" :disabled="exportando" @click="handleExportar">
        <Download :size="14" />
        {{ exportando ? 'Gerando...' : 'Exportar meus dados' }}
      </button>

      <div class="toggle-row">
        <label class="toggle-label" :class="{ desabilitado: !perfilExiste }">
          <input
            type="checkbox"
            v-model="form.aceitaEmailFollowup"
            :disabled="!perfilExiste || salvandoToggle"
            @change="handleToggleFollowup"
          />
          Receber lembrete diário de follow-up por email
        </label>
        <p v-if="!perfilExiste" class="toggle-hint">Disponível depois de salvar seu perfil.</p>
      </div>
    </div>

    <!-- ── Zona de perigo ── -->
    <div class="card card-perigo">
      <h2 class="card-title">Excluir conta</h2>
      <p class="card-sub">
        Apaga permanentemente sua conta e tudo que pertence a ela, incluindo os
        arquivos de currículo. Essa ação não pode ser desfeita.
      </p>
      <button class="btn-perigo" @click="modalAberto = true">Excluir minha conta</button>
    </div>

    <!-- Modal de confirmação -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
          <div class="modal">
            <h3 class="modal-titulo">Excluir sua conta?</h3>
            <p class="modal-sub">
              Todos os seus dados serão apagados de forma permanente.
              Para confirmar, digite sua senha.
            </p>
            <form @submit.prevent="handleExcluir">
              <input
                v-model="senha"
                type="password"
                placeholder="Sua senha"
                autocomplete="current-password"
                required
              />
              <p v-if="erroExcluir" class="erro">{{ erroExcluir }}</p>
              <div class="modal-acoes">
                <button type="button" class="btn-secundario" @click="fecharModal">Cancelar</button>
                <button type="submit" class="btn-perigo" :disabled="excluindo">
                  <Loader2 v-if="excluindo" :size="14" class="spin" />
                  {{ excluindo ? 'Excluindo...' : 'Excluir permanentemente' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { exportarDados, excluirConta } from '@/api/conta'
import { buscar as buscarPerfil, salvar as salvarPerfil } from '@/api/perfil'
import { Download, Loader2 } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const toast = useToastStore()

const NIVEIS = [
  { valor: 'ESTAGIARIO', label: 'Estagiário' },
  { valor: 'JUNIOR', label: 'Júnior' },
  { valor: 'PLENO', label: 'Pleno' },
  { valor: 'SENIOR', label: 'Sênior' },
  { valor: 'ESPECIALISTA', label: 'Especialista' },
  { valor: 'STAFF', label: 'Staff' }
]
const DISPONIBILIDADES = [
  { valor: 'IMEDIATA', label: 'Imediata' },
  { valor: 'DIAS_15', label: '15 dias' },
  { valor: 'DIAS_30', label: '30 dias' },
  { valor: 'DIAS_60', label: '60 dias' },
  { valor: 'SONDANDO_MERCADO', label: 'Sondando o mercado' }
]

function formVazio() {
  return {
    nomeCompleto: '', telefone: '', cidade: '', estado: '',
    aceitaRemoto: false, aceitaHibrido: false, aceitaPresencial: false,
    aceitaEmailFollowup: true,
    nivelExperiencia: null, disponibilidade: null,
    pretensaoSalarialMin: '', pretensaoSalarialMax: '',
    urlLinkedin: '', urlGithub: '', urlPortfolio: '', resumoProfissional: ''
  }
}

const form = reactive(formVazio())
const perfilExiste = ref(false)
const carregando = ref(true)
const salvando = ref(false)
const salvandoToggle = ref(false)
const tentouSalvar = ref(false)

onMounted(async () => {
  try {
    const { data } = await buscarPerfil()
    perfilExiste.value = true
    Object.assign(form, {
      nomeCompleto: data.nomeCompleto ?? '',
      telefone: data.telefone ?? '',
      cidade: data.cidade ?? '',
      estado: data.estado ?? '',
      aceitaRemoto: !!data.aceitaRemoto,
      aceitaHibrido: !!data.aceitaHibrido,
      aceitaPresencial: !!data.aceitaPresencial,
      aceitaEmailFollowup: data.aceitaEmailFollowup !== false,
      nivelExperiencia: data.nivelExperiencia ?? null,
      disponibilidade: data.disponibilidade ?? null,
      pretensaoSalarialMin: data.pretensaoSalarialMin ?? '',
      pretensaoSalarialMax: data.pretensaoSalarialMax ?? '',
      urlLinkedin: data.urlLinkedin ?? '',
      urlGithub: data.urlGithub ?? '',
      urlPortfolio: data.urlPortfolio ?? '',
      resumoProfissional: data.resumoProfissional ?? ''
    })
  } catch {
    perfilExiste.value = false // perfil ainda não preenchido
  } finally {
    carregando.value = false
  }
})

// ── Validação inline ──
const erros = computed(() => {
  if (!tentouSalvar.value) return {}
  const e = {}
  if (!form.nomeCompleto?.trim()) e.nomeCompleto = 'Informe seu nome completo.'
  if (form.estado && form.estado.length !== 2) e.estado = 'Use a sigla de 2 letras (ex: SP).'

  const min = parseFloat(form.pretensaoSalarialMin)
  const max = parseFloat(form.pretensaoSalarialMax)
  if (form.pretensaoSalarialMin !== '' && !(min > 0)) e.pretensao = 'A pretensão deve ser maior que zero.'
  else if (form.pretensaoSalarialMax !== '' && !(max > 0)) e.pretensao = 'A pretensão deve ser maior que zero.'
  else if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) e.pretensao = 'A mínima não pode ser maior que a máxima.'

  for (const [campo, url] of [['urlLinkedin', form.urlLinkedin], ['urlGithub', form.urlGithub], ['urlPortfolio', form.urlPortfolio]]) {
    if (url && url.length > 255) e[campo] = 'Link muito longo (máx. 255).'
  }
  return e
})

function revalidar() { /* dispara reatividade do computed enquanto o usuário corrige */ }

function payload() {
  const num = (v) => (v === '' || v === null ? null : Number(v))
  return {
    nomeCompleto: form.nomeCompleto?.trim(),
    telefone: form.telefone || null,
    cidade: form.cidade || null,
    estado: form.estado ? form.estado.toUpperCase() : null,
    aceitaRemoto: form.aceitaRemoto,
    aceitaHibrido: form.aceitaHibrido,
    aceitaPresencial: form.aceitaPresencial,
    aceitaEmailFollowup: form.aceitaEmailFollowup,
    nivelExperiencia: form.nivelExperiencia,
    disponibilidade: form.disponibilidade,
    pretensaoSalarialMin: num(form.pretensaoSalarialMin),
    pretensaoSalarialMax: num(form.pretensaoSalarialMax),
    urlLinkedin: form.urlLinkedin || null,
    urlGithub: form.urlGithub || null,
    urlPortfolio: form.urlPortfolio || null,
    resumoProfissional: form.resumoProfissional || null
  }
}

async function handleSalvar() {
  tentouSalvar.value = true
  if (Object.keys(erros.value).length > 0) {
    toast.erro('Revise os campos destacados.')
    return
  }
  salvando.value = true
  try {
    await salvarPerfil(payload())
    perfilExiste.value = true
    toast.sucesso('Perfil salvo.')
  } catch (error) {
    toast.erro(error.response?.data?.mensagem || 'Não foi possível salvar o perfil.')
  } finally {
    salvando.value = false
  }
}

async function handleToggleFollowup() {
  if (!perfilExiste.value) return
  salvandoToggle.value = true
  try {
    await salvarPerfil(payload())
    toast.sucesso(form.aceitaEmailFollowup ? 'Lembretes ativados.' : 'Lembretes desativados.')
  } catch {
    form.aceitaEmailFollowup = !form.aceitaEmailFollowup // desfaz visualmente
    toast.erro('Não foi possível salvar a preferência.')
  } finally {
    salvandoToggle.value = false
  }
}

// ── Exportação e exclusão ──
const exportando = ref(false)
const modalAberto = ref(false)
const senha = ref('')
const excluindo = ref(false)
const erroExcluir = ref(null)

async function handleExportar() {
  exportando.value = true
  try {
    const { data } = await exportarDados()
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = 'joboard-dados.zip'
    link.click()
    URL.revokeObjectURL(url)
    toast.sucesso('Exportação gerada.')
  } catch {
    toast.erro('Não foi possível gerar a exportação. Tente novamente.')
  } finally {
    exportando.value = false
  }
}

function fecharModal() {
  modalAberto.value = false
  senha.value = ''
  erroExcluir.value = null
}

async function handleExcluir() {
  excluindo.value = true
  erroExcluir.value = null
  try {
    await excluirConta(senha.value)
    auth.logout()
    router.push('/login')
  } catch (error) {
    erroExcluir.value = error.response?.data?.mensagem || 'Não foi possível excluir a conta.'
  } finally {
    excluindo.value = false
  }
}
</script>

<style scoped>
.perfil-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 680px;
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
  margin-bottom: 16px;
}

/* Grupos de campos */
.grupo {
  padding-top: 20px;
  margin-top: 4px;
  border-top: 1px solid var(--border-subtle);
}
.grupo:first-of-type { border-top: none; padding-top: 4px; }

.grupo-titulo {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.form-row:has(.field-uf) {
  grid-template-columns: 1fr 1fr 80px;
}
.form-row + .form-row { margin-top: 14px; }

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.field + .field { margin-top: 14px; }
.form-row .field + .field { margin-top: 0; }

.field label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 13.5px;
  font-family: inherit;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--moss);
  background: var(--surface);
  box-shadow: 0 0 0 3px var(--moss-subtle);
}

.field input::placeholder,
.field textarea::placeholder { color: var(--text-muted); }

.input-erro,
.input-erro:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-subtle);
}

.campo-erro {
  font-size: 11.5px;
  color: var(--danger);
}
.campo-erro--bloco { display: block; margin-top: 8px; }

.contador {
  align-self: flex-end;
  font-size: 11px;
  color: var(--text-muted);
}

/* Chips de modelo de trabalho */
.chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface-alt);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.chip:hover { border-color: var(--text-muted); }
.chip.ativo {
  border-color: var(--moss);
  background: var(--moss-subtle);
  color: var(--moss);
}
.chip input { accent-color: var(--moss); width: 15px; height: 15px; }

.form-acoes {
  display: flex;
  justify-content: flex-end;
  padding-top: 22px;
  margin-top: 4px;
  border-top: 1px solid var(--border-subtle);
}

/* Skeleton do form */
.form-skeleton { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
.sk-line { height: 40px; border-radius: 10px; background: var(--surface-alt); position: relative; overflow: hidden; }
.sk-line::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer { 100% { transform: translateX(100%); } }
.sk-line::after { transform: translateX(-100%); }
.sk-line:nth-child(2) { width: 70%; }
.sk-line:nth-child(4) { width: 85%; }

/* Botões */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border: none;
  border-radius: 10px;
  background: var(--moss);
  color: var(--text-inverse);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: var(--moss-hover); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secundario {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-secundario:hover:not(:disabled) { border-color: var(--text-muted); }
.btn-secundario:disabled { opacity: 0.6; cursor: not-allowed; }

.card-perigo { border-color: var(--danger-subtle); }

.btn-perigo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: var(--danger);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.15s;
}
.btn-perigo:hover:not(:disabled) { filter: brightness(0.95); }
.btn-perigo:disabled { opacity: 0.6; cursor: not-allowed; }

/* Toggle follow-up */
.toggle-row {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}
.toggle-label.desabilitado { opacity: 0.55; cursor: not-allowed; }
.toggle-label input { accent-color: var(--moss); width: 16px; height: 16px; }
.toggle-hint { font-size: 12px; color: var(--text-muted); margin-top: 6px; }

.erro {
  font-size: 12px;
  color: var(--danger);
  padding: 8px 10px;
  background: var(--danger-subtle);
  border: 1px solid var(--danger-subtle);
  border-radius: 10px;
  margin-top: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 24, 20, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}
.modal {
  width: 100%;
  max-width: 400px;
  padding: 28px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.modal-titulo {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.modal-sub {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
}
.modal input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}
.modal input:focus {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px var(--moss-subtle);
}
.modal-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

/* Transições de modal */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.96); opacity: 0; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
