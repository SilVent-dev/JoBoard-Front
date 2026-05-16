<template>
  <div class="auth-split">

    <!-- ── Painel esquerdo: arte orgânica ── -->
    <div class="art-panel">
      <div class="art-blobs">
        <div class="blob b1"></div>
        <div class="blob b2"></div>
        <div class="blob b3"></div>
        <div class="blob b4"></div>
        <div class="blob-mountain"></div>
      </div>

      <div class="panel-top">
        <div class="panel-logo">
          <div class="logo-mark">
            <Briefcase :size="15" />
          </div>
          <span>Joboard</span>
        </div>
      </div>

      <div class="panel-bottom">
        <p class="panel-tagline">Sua jornada de<br>carreira, organizada.</p>
        <p class="panel-sub">Rastreie cada candidatura,<br>cada entrevista, cada passo.</p>
        <div class="panel-dots">
          <span class="dot active"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- ── Área do formulário com glass card ── -->
    <div class="form-area">
      <!-- blobs suaves de fundo para o efeito glass funcionar -->
      <div class="bg-blob bg-blob--1"></div>
      <div class="bg-blob bg-blob--2"></div>
      <div class="bg-blob bg-blob--3"></div>

      <div class="glass-card">
        <div class="form-header">
          <h2 class="form-title">Bem-vinda de volta</h2>
          <p class="form-sub">Entre na sua conta para continuar</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="field">
            <label>Email</label>
            <div class="input-wrap">
              <Mail :size="14" class="input-icon" />
              <input
                v-model="form.email"
                type="email"
                placeholder="seu@email.com"
                autocomplete="email"
                required
              />
            </div>
          </div>

          <div class="field">
            <label>Senha</label>
            <div class="input-wrap">
              <Lock :size="14" class="input-icon" />
              <input
                v-model="form.senha"
                :type="mostrarSenha ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button type="button" class="toggle-senha" @click="mostrarSenha = !mostrarSenha">
                <Eye v-if="!mostrarSenha" :size="13" />
                <EyeOff v-else :size="13" />
              </button>
            </div>
          </div>

          <p v-if="auth.erro" class="erro">{{ auth.erro }}</p>

          <button type="submit" class="btn-primary" :disabled="auth.carregando">
            <Loader2 v-if="auth.carregando" :size="14" class="spin" />
            {{ auth.carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="divider"><span>OU</span></div>

        <div class="oauth-row">
          <button class="oauth-btn" type="button" title="Google">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
          <button class="oauth-btn" type="button" title="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button class="oauth-btn" type="button" title="Apple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11"/>
            </svg>
          </button>
        </div>

        <p class="auth-link">
          Não tem conta?
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
import { Briefcase, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'

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
/* ═══════════════════════════════════════
   Layout geral — split screen
═══════════════════════════════════════ */
.auth-split {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ═══════════════════════════════════════
   Painel esquerdo — arte laranja orgânica
═══════════════════════════════════════ */
.art-panel {
  width: 400px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 36px;
  background: #D94518;
}

/* Container dos blobs */
.art-blobs {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
}

/* Blob claro — highlight topo */
.b1 {
  width: 420px;
  height: 420px;
  top: -140px;
  right: -100px;
  background: radial-gradient(
    ellipse at 40% 35%,
    #F8DCC8 0%,
    #F2B088 25%,
    #E07040 55%,
    transparent 72%
  );
  opacity: 0.9;
}

/* Blob médio — lateral esquerda */
.b2 {
  width: 320px;
  height: 320px;
  top: 15%;
  left: -100px;
  background: radial-gradient(
    ellipse at 60% 50%,
    #F5C090 0%,
    #E08050 35%,
    transparent 65%
  );
  opacity: 0.5;
}

/* Blob peach — centro */
.b3 {
  width: 280px;
  height: 280px;
  top: 38%;
  right: -60px;
  background: radial-gradient(
    ellipse at 45% 40%,
    #F0A870 0%,
    #D06030 45%,
    transparent 68%
  );
  opacity: 0.55;
}

/* Blob escuro — base */
.b4 {
  width: 360px;
  height: 220px;
  bottom: 25%;
  left: -40px;
  background: radial-gradient(
    ellipse at 50% 80%,
    #A03010 0%,
    #C04825 45%,
    transparent 70%
  );
  opacity: 0.7;
}

/* Silhueta de "montanha/duna" central */
.blob-mountain {
  position: absolute;
  bottom: 22%;
  left: -15%;
  width: 130%;
  height: 52%;
  background: radial-gradient(
    ellipse 72% 100% at 50% 100%,
    #6A1E08 0%,
    #8C2F14 20%,
    #B04525 45%,
    #CC6035 62%,
    transparent 78%
  );
  border-radius: 48% 52% 0 0 / 60% 60% 0 0;
}

/* ── Conteúdo do painel ── */
.panel-top,
.panel-bottom {
  position: relative;
  z-index: 1;
}

.panel-logo {
  display: flex;
  align-items: center;
  gap: 9px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-logo span {
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: -0.02em;
}

.panel-bottom {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 8px;
}

.panel-tagline {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin-bottom: 10px;
}

.panel-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.65;
  margin-bottom: 24px;
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
  background: rgba(255, 255, 255, 0.28);
  transition: all 0.2s;
}

.dot.active {
  width: 22px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.82);
}

/* ═══════════════════════════════════════
   Área do formulário — fundo quente
═══════════════════════════════════════ */
.form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 64px;
  background: #F5F0EB;
  position: relative;
  overflow: hidden;
}

/* Blobs suaves no fundo para o glass ter textura atrás */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.bg-blob--1 {
  width: 480px;
  height: 480px;
  top: -180px;
  right: -140px;
  background: radial-gradient(circle, rgba(217, 69, 24, 0.13) 0%, transparent 65%);
}

.bg-blob--2 {
  width: 360px;
  height: 360px;
  bottom: -120px;
  left: -80px;
  background: radial-gradient(circle, rgba(240, 130, 60, 0.10) 0%, transparent 65%);
}

.bg-blob--3 {
  width: 220px;
  height: 220px;
  top: 40%;
  left: 55%;
  background: radial-gradient(circle, rgba(217, 69, 24, 0.07) 0%, transparent 60%);
}

/* ═══════════════════════════════════════
   Card liquid glass
═══════════════════════════════════════ */
.glass-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 44px 48px;
  border-radius: 28px;

  /* Liquid glass core */
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(48px) saturate(160%) brightness(1.04);
  -webkit-backdrop-filter: blur(48px) saturate(160%) brightness(1.04);

  /* Borda + highlight interno */
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow:
    /* highlight topo — luz entrando pelo topo */
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    /* brilho sutil nas laterais */
    1px 0 0 rgba(255, 255, 255, 0.45) inset,
    -1px 0 0 rgba(255, 255, 255, 0.35) inset,
    /* sombra base suave */
    0 4px 16px rgba(0, 0, 0, 0.05),
    0 16px 48px rgba(0, 0, 0, 0.09),
    0 40px 80px rgba(0, 0, 0, 0.06);
}

/* Faixa de highlight superior (lens flare) */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.95) 30%,
    rgba(255, 255, 255, 0.95) 70%,
    transparent
  );
  border-radius: 0 0 50% 50%;
}

/* ── Cabeçalho do form ── */
.form-header {
  margin-bottom: 30px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1208;
  letter-spacing: -0.025em;
  margin-bottom: 6px;
}

.form-sub {
  font-size: 13.5px;
  color: #9a8878;
}

/* ── Campos ── */
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 11.5px;
  font-weight: 600;
  color: #6a5a4a;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #b8a898;
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 11px 12px 11px 36px;
  border: 1px solid rgba(200, 180, 160, 0.5);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #1a1208;
  font-size: 14px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  outline: none;
}

.input-wrap input:focus {
  border-color: rgba(217, 69, 24, 0.6);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 0 0 3px rgba(217, 69, 24, 0.08);
}

.toggle-senha {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #b8a898;
  padding: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.12s;
}

.toggle-senha:hover { color: #6a5a4a; }

.erro {
  font-size: 12px;
  color: #c0392b;
  padding: 8px 10px;
  background: rgba(252, 235, 235, 0.8);
  border: 1px solid rgba(254, 202, 202, 0.8);
  border-radius: 10px;
  backdrop-filter: blur(4px);
}

/* ── Botão ── */
.btn-primary {
  width: 100%;
  padding: 12px;
  background: #D94518;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(217, 69, 24, 0.35), 0 1px 0 rgba(255, 255, 255, 0.15) inset;
}

.btn-primary:hover:not(:disabled) {
  background: #BB3510;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(217, 69, 24, 0.4);
}

.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divisor ── */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-size: 11px;
  color: rgba(100, 80, 60, 0.5);
  letter-spacing: 0.08em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(180, 155, 130, 0.3);
}

/* ── OAuth ── */
.oauth-row {
  display: flex;
  gap: 10px;
}

.oauth-btn {
  flex: 1;
  height: 40px;
  border: 1px solid rgba(190, 165, 140, 0.4);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}

.oauth-btn:hover {
  border-color: rgba(190, 165, 140, 0.7);
  background: rgba(255, 255, 255, 0.75);
  transform: translateY(-1px);
}

/* ── Link ── */
.auth-link {
  text-align: center;
  font-size: 13px;
  color: #9a8878;
  margin-top: 20px;
}

.auth-link a {
  color: #D94518;
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover { text-decoration: underline; }
</style>