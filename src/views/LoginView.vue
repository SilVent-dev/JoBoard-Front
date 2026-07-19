<template>
  <div class="auth-split">

    <!-- ── Painel esquerdo: musgo sólido com glows ── -->
    <div class="art-panel">
      <div class="glow glow-clay"></div>
      <div class="glow glow-light"></div>

      <div class="panel-top">
        <div class="panel-logo">
          <div class="logo-mark">
            <div class="logo-diamond"></div>
          </div>
          <span>Marco</span>
        </div>
      </div>

      <div class="panel-bottom">
        <p class="panel-tagline">Cada etapa da<br>sua busca, no lugar certo.</p>
        <p class="panel-sub">Sem planilha perdida, sem aba<br>esquecida. Só o essencial.</p>
        <div class="panel-dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- ── Área do formulário ── -->
    <div class="form-area">
      <div class="form-card">
        <div class="form-header">
          <h2 class="form-title">Que bom te ver de novo</h2>
          <p class="form-sub">Continue de onde parou na sua busca</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="field">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="field">
            <div class="label-row">
              <label>Senha</label>
              <RouterLink to="/esqueci-senha" class="esqueci-link">Esqueci minha senha</RouterLink>
            </div>
            <div class="input-wrap">
              <input
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha">
                {{ mostrarSenha ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <p v-if="auth.erro" class="erro">{{ auth.erro }}</p>

          <button type="submit" class="btn-primary" :disabled="auth.carregando">
            <Loader2 v-if="auth.carregando" :size="14" class="spin" />
            {{ auth.carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="divider"><span>ou</span></div>

        <div class="oauth-row">
          <button class="oauth-btn" type="button" title="Google">G</button>
          <button class="oauth-btn" type="button" title="LinkedIn">in</button>
          <button class="oauth-btn" type="button" title="GitHub">gh</button>
        </div>

        <p class="auth-link">
          Ainda não tem conta?
          <RouterLink to="/cadastro">Criar conta</RouterLink>
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Loader2 } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const mostrarSenha = ref(false)
const form = reactive({ email: '', senha: '' })

async function handleLogin() {
  const sucesso = await auth.login(form.email, form.senha)
  if (sucesso) router.push('/')
}
</script>

<style scoped>
.auth-split {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* ── Painel esquerdo — musgo sólido ── */
.art-panel {
  width: 400px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 44px;
  background: var(--moss);
}

.glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.glow-clay {
  top: -140px;
  right: -120px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(193, 101, 46, 0.30) 0%, transparent 68%);
}

.glow-light {
  bottom: -100px;
  left: -90px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 65%);
}

.panel-top,
.panel-bottom {
  position: relative;
  z-index: 1;
}

.panel-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-diamond {
  width: 12px;
  height: 12px;
  background: var(--clay);
  transform: rotate(45deg);
  border-radius: 3px;
}

.panel-logo span {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-inverse);
  letter-spacing: -0.01em;
}

.panel-tagline {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  color: var(--text-inverse);
  line-height: 1.25;
  letter-spacing: -0.01em;
  margin-bottom: 12px;
}

.panel-sub {
  font-size: 13.5px;
  color: rgba(241, 243, 236, 0.7);
  line-height: 1.65;
  margin-bottom: 26px;
}

.panel-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(241, 243, 236, 0.25);
}

.dot.active {
  width: 22px;
  border-radius: 3px;
  background: var(--clay);
}

/* ── Área do formulário ── */
.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
}

.form-card {
  width: 100%;
  max-width: 392px;
  padding: 44px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 24px 56px rgba(32, 36, 30, 0.08);
}

.form-header {
  margin-bottom: 28px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}

.form-sub {
  font-size: 13.5px;
  color: var(--text-muted);
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.esqueci-link {
  font-size: 11px;
  font-weight: 600;
  color: var(--moss);
  text-decoration: none;
}

.esqueci-link:hover { text-decoration: underline; }

.field input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
}

.field input:focus {
  border-color: var(--moss);
  box-shadow: 0 0 0 3px var(--moss-subtle);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input {
  padding-right: 52px;
}

.toggle-senha {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--moss);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.erro {
  font-size: 12px;
  color: var(--danger);
  padding: 8px 10px;
  background: var(--danger-subtle);
  border: 1px solid var(--danger-subtle);
  border-radius: 10px;
}

.btn-primary {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--moss);
  color: var(--text-inverse);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(63, 93, 78, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: var(--moss-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.oauth-row {
  display: flex;
  gap: 10px;
}

.oauth-btn {
  flex: 1;
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
}

.oauth-btn:hover {
  border-color: var(--text-muted);
}

.auth-link {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 24px;
}

.auth-link a {
  color: var(--moss);
  font-weight: 700;
  text-decoration: none;
}

.auth-link a:hover { text-decoration: underline; }
</style>
