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
        <p class="panel-tagline">Sem pânico.<br>Acontece com todo mundo.</p>
        <p class="panel-sub">Um link no seu email e você<br>volta de onde parou.</p>
        <div class="panel-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot active"></span>
        </div>
      </div>
    </div>

    <!-- ── Área do formulário ── -->
    <div class="form-area">
      <div class="form-card">

        <div v-if="!enviado">
          <div class="form-header">
            <h2 class="form-title">Esqueceu sua senha?</h2>
            <p class="form-sub">Informe seu email e enviaremos um link para redefinir</p>
          </div>

          <form @submit.prevent="handleEnviar">
            <div class="field">
              <label>Email</label>
              <input
                v-model="email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
              />
            </div>

            <p v-if="erro" class="erro">{{ erro }}</p>

            <button type="submit" class="btn-primary" :disabled="carregando">
              <Loader2 v-if="carregando" :size="14" class="spin" />
              {{ carregando ? 'Enviando...' : 'Enviar link' }}
            </button>
          </form>

          <p class="auth-link">
            Lembrou a senha?
            <RouterLink to="/login">Voltar ao login</RouterLink>
          </p>
        </div>

        <div v-else class="sucesso-box">
          <div class="sucesso-ring">✓</div>
          <p class="sucesso-titulo">Confira seu email</p>
          <p class="sucesso-sub">
            Se este email estiver cadastrado, você receberá um link para
            redefinir a senha. Ele vale por 30 minutos.
          </p>
          <RouterLink to="/login" class="btn-primary btn-link">Voltar ao login</RouterLink>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { esqueciSenha } from '@/api/auth'
import { Loader2 } from 'lucide-vue-next'

const email = ref('')
const enviado = ref(false)
const carregando = ref(false)
const erro = ref(null)

async function handleEnviar() {
  carregando.value = true
  erro.value = null
  try {
    await esqueciSenha({ email: email.value })
    enviado.value = true
  } catch (error) {
    erro.value = error.response?.data?.mensagem || 'Não foi possível enviar. Tente novamente.'
  } finally {
    carregando.value = false
  }
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

.btn-link {
  text-decoration: none;
  margin-top: 20px;
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.sucesso-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.sucesso-ring {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--moss-subtle);
  color: var(--moss);
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.sucesso-titulo {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.sucesso-sub {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
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
